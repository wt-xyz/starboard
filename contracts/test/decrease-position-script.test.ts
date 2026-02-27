import { AbstractContract, WalletUnlocked } from "fuels"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { launchNode, getNodeWallets } from "./node.js"
import {
    call,
    walletToAddressIdentity,
    AddressIdentity,
    expandDecimals,
    BTC_ASSET,
    BASE_ASSET,
    getBtcConfig,
    getAssetId,
} from "./utils.js"
import { DeployContractConfig, LaunchTestNodeReturn } from "fuels/test-utils"
import {
    Fungible,
    FungibleFactory,
    PricefeedWrapper,
    PricefeedWrapperFactory,
    StorkMock,
    StorkMockFactory,
    Vault,
    VaultFactory,
} from "../types/index.js"
import { IncreasePositionScript, DecreasePositionScript } from "../fuel-script-types/index.js"

describe("decrease-position-script", () => {
    let attachedContracts: AbstractContract[]
    let launchedNode: LaunchTestNodeReturn<DeployContractConfig[]>
    let deployer: WalletUnlocked
    let user0: WalletUnlocked
    let deployerIdentity: AddressIdentity
    let user0Identity: AddressIdentity
    let USDC: Fungible
    let USDC_ASSET_ID: string
    let storkMock: StorkMock
    let pricefeedWrapper: PricefeedWrapper
    let vault: Vault

    beforeEach(async () => {
        launchedNode = await launchNode()
        ;[deployer, user0] = getNodeWallets(launchedNode)

        deployerIdentity = walletToAddressIdentity(deployer)
        user0Identity = walletToAddressIdentity(user0)

        const { waitForResult: waitForResultUSDC } = await FungibleFactory.deploy(deployer)
        const { contract: USDCDeployed } = await waitForResultUSDC()
        USDC = USDCDeployed

        USDC_ASSET_ID = getAssetId(USDC)

        const { waitForResult: waitForResultStorkMock } = await StorkMockFactory.deploy(deployer)
        const { contract: storkMockDeployed } = await waitForResultStorkMock()
        storkMock = storkMockDeployed
        const { waitForResult: waitForResultPricefeedWrapper } = await PricefeedWrapperFactory.deploy(deployer, {
            configurableConstants: {
                STORK_CONTRACT: { bits: storkMock.id.b256Address },
            },
        })
        const { contract: pricefeedWrapperDeployed } = await waitForResultPricefeedWrapper()
        pricefeedWrapper = pricefeedWrapperDeployed

        const { waitForResult: waitForResultVaultImpl } = await VaultFactory.deploy(deployer, {
            configurableConstants: {
                BASE_ASSET_ID: { bits: USDC_ASSET_ID },
                BASE_ASSET,
                BASE_ASSET_DECIMALS: 9,
                PRICEFEED_WRAPPER: { bits: pricefeedWrapper.id.b256Address },
            },
        })
        const { contract: vaultImpl } = await waitForResultVaultImpl()

        vault = new Vault(vaultImpl.id.toAddress(), deployer)

        attachedContracts = [vault, vaultImpl, storkMock, pricefeedWrapper]

        await call(vault.functions.initialize(deployerIdentity))
        await call(vault.functions.set_asset_config(...getBtcConfig()))

        await call(storkMock.functions.update_price(BASE_ASSET, expandDecimals(1, 18)))
        await call(storkMock.functions.update_price(BTC_ASSET, expandDecimals(40000, 18)))

        await call(USDC.functions.mint(user0Identity, expandDecimals(40000)))
        await call(USDC.functions.mint(deployerIdentity, expandDecimals(40000)))

        // Add liquidity so positions can be opened
        await call(
            vault.functions
                .add_liquidity(deployerIdentity)
                .addContracts(attachedContracts)
                .callParams({
                    forward: [expandDecimals(40000), USDC_ASSET_ID],
                }),
        )
    })

    it("calls decrease-position-script successfully for a long position", async () => {
        // Open long position via increase-position-script
        const increaseScript = new IncreasePositionScript(user0)
        increaseScript.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })
        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        const limitPriceOpen = expandDecimals(40001, 18)
        const txOpen = increaseScript.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, true, collateralDelta, limitPriceOpen)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    { amount: collateralDelta, assetId: USDC_ASSET_ID, account: user0, changeOutputAccount: user0 },
                ],
            })
        await txOpen
            .addContracts(attachedContracts)
            .call()
            .then(({ waitForResult }) => waitForResult())

        const positionKey = (await vault.functions.get_position_key(user0Identity, BTC_ASSET, true).get()).value
        const position = (await vault.functions.get_position_by_key(positionKey).get()).value

        // Decrease half the position; for long we require price >= limit (min acceptable)
        const collateralDeltaDec = position.collateral.div(2)
        const sizeDeltaDec = position.size.div(2)
        const limitPriceDec = expandDecimals(39999, 18) // current 40_000, so 39999 is acceptable

        const decreaseScript = new DecreasePositionScript(user0)
        decreaseScript.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
        })
        const { waitForResult } = await decreaseScript.functions
            .main(user0Identity, BTC_ASSET, collateralDeltaDec, sizeDeltaDec, true, user0Identity, limitPriceDec)
            .txParams({ gasLimit: 10_000_000 })
            .addContracts(attachedContracts)
            .call()
        const result = await waitForResult()

        expect(result).toBeDefined()
        const [, price, paidOutCollateral] = result.value
        expect(price.gte(limitPriceDec)).eq(true)
        expect(!paidOutCollateral.isZero()).eq(true)

        const positionAfter = (await vault.functions.get_position_by_key(positionKey).get()).value
        expect(positionAfter.size.lt(position.size)).eq(true)
        expect(positionAfter.collateral.lt(position.collateral)).eq(true)
    })

    it("calls decrease-position-script successfully for a short position", async () => {
        const increaseScript = new IncreasePositionScript(user0)
        increaseScript.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })
        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        const limitPriceOpen = expandDecimals(39999, 18)
        const txOpen = increaseScript.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, false, collateralDelta, limitPriceOpen)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    { amount: collateralDelta, assetId: USDC_ASSET_ID, account: user0, changeOutputAccount: user0 },
                ],
            })
        await txOpen
            .addContracts(attachedContracts)
            .call()
            .then(({ waitForResult }) => waitForResult())

        const positionKey = (await vault.functions.get_position_key(user0Identity, BTC_ASSET, false).get()).value
        const position = (await vault.functions.get_position_by_key(positionKey).get()).value

        // For short we require price <= limit (max we're willing to pay to cover)
        const collateralDeltaDec = position.collateral.div(2)
        const sizeDeltaDec = position.size.div(2)
        const limitPriceDec = expandDecimals(40001, 18) // current 40_000, so 40001 is acceptable

        const decreaseScript = new DecreasePositionScript(user0)
        decreaseScript.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
        })
        const { waitForResult } = await decreaseScript.functions
            .main(user0Identity, BTC_ASSET, collateralDeltaDec, sizeDeltaDec, false, user0Identity, limitPriceDec)
            .txParams({ gasLimit: 10_000_000 })
            .addContracts(attachedContracts)
            .call()
        const result = await waitForResult()

        expect(result).toBeDefined()
        const [, price, paidOutCollateral] = result.value
        expect(price.lte(limitPriceDec)).eq(true)
        expect(!paidOutCollateral.isZero()).eq(true)
    })

    it("fails for long when current price is below limit price", async () => {
        const increaseScript = new IncreasePositionScript(user0)
        increaseScript.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })
        const txOpen = increaseScript.functions
            .main(user0Identity, BTC_ASSET, expandDecimals(10000), true, expandDecimals(400), expandDecimals(40001, 18))
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: expandDecimals(400),
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        await txOpen
            .addContracts(attachedContracts)
            .call()
            .then(({ waitForResult }) => waitForResult())

        const positionKey = (await vault.functions.get_position_key(user0Identity, BTC_ASSET, true).get()).value
        const position = (await vault.functions.get_position_by_key(positionKey).get()).value

        const decreaseScript = new DecreasePositionScript(user0)
        decreaseScript.setConfigurableConstants({ VAULT: { bits: vault.id.toHexString() } })
        // For long we need price >= limit. Current price 40_000; set limit 40_001 so it fails
        const limitPrice = expandDecimals(40001, 18)
        const tx = decreaseScript.functions
            .main(user0Identity, BTC_ASSET, position.collateral.div(2), position.size.div(2), true, user0Identity, limitPrice)
            .txParams({ gasLimit: 10_000_000 })
            .addContracts(attachedContracts)
            .call()

        await expect(tx.then(({ waitForResult }) => waitForResult())).rejects.toThrow(
            /VaultPriceSlippageExceeded|revert|OutputVariable/i,
        )
    })

    it("fails for short when current price is above limit price", async () => {
        const increaseScript = new IncreasePositionScript(user0)
        increaseScript.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })
        const txOpen = increaseScript.functions
            .main(user0Identity, BTC_ASSET, expandDecimals(10000), false, expandDecimals(400), expandDecimals(39999, 18))
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: expandDecimals(400),
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        await txOpen
            .addContracts(attachedContracts)
            .call()
            .then(({ waitForResult }) => waitForResult())

        const positionKey = (await vault.functions.get_position_key(user0Identity, BTC_ASSET, false).get()).value
        const position = (await vault.functions.get_position_by_key(positionKey).get()).value

        const decreaseScript = new DecreasePositionScript(user0)
        decreaseScript.setConfigurableConstants({ VAULT: { bits: vault.id.toHexString() } })
        // For short we need price <= limit. Current price 40_000; set limit 39_999 so it fails
        const limitPrice = expandDecimals(39999, 18)
        const tx = decreaseScript.functions
            .main(user0Identity, BTC_ASSET, position.collateral.div(2), position.size.div(2), false, user0Identity, limitPrice)
            .txParams({ gasLimit: 10_000_000 })
            .addContracts(attachedContracts)
            .call()

        await expect(tx.then(({ waitForResult }) => waitForResult())).rejects.toThrow(
            /VaultPriceSlippageExceeded|revert|OutputVariable/i,
        )
    })

    afterEach(async () => {
        launchedNode.cleanup()
    })
})

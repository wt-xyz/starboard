import { WalletUnlocked } from "fuels"
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
import { IncreasePositionScript } from "../fuel-script-types/index.js"

describe("increase-position-script", () => {
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

        /*
            NativeAsset + Pricefeed
        */
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

        // Use vaultImpl directly (no proxy) for this simple script test
        vault = new Vault(vaultImpl.id.toAddress(), deployer)

        await call(vault.functions.initialize(deployerIdentity))
        await call(vault.functions.set_asset_config(...getBtcConfig()))

        await call(storkMock.functions.update_price(BASE_ASSET, expandDecimals(1, 18)))
        await call(storkMock.functions.update_price(BTC_ASSET, expandDecimals(40000, 18)))

        // Mint collateral to user
        await call(USDC.functions.mint(user0Identity, expandDecimals(40000)))
    })

    it("calls increase-position-script which increases position successfully", async () => {
        const script = new IncreasePositionScript(user0)
        script.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })

        // Call script main; internally it calls VAULT.increase_position(...).
        // Forward USDC to the script so it can send that amount to the vault as collateral.
        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        const limitPrice = expandDecimals(40001, 18)
        const tx = script.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, true, collateralDelta, limitPrice)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: collateralDelta,
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        const { waitForResult } = await tx.call()
        await waitForResult()

        // Verify a position was opened for user0
        const positionKey = (await vault.functions.get_position_key(user0Identity, BTC_ASSET, true).get()).value
        const position = (await vault.functions.get_position_by_key(positionKey).get()).value

        expect(position.size.toString()).eq(sizeDelta)
        expect(!position.collateral.isZero()).eq(true)
        const balance = await vault.getBalance(USDC_ASSET_ID)
        expect(balance.toString()).eq(collateralDelta)
    })

    it("fails when current BTC price is above the limit price", async () => {
        const script = new IncreasePositionScript(user0)
        script.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })

        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        // Current BTC price is 40_000; set limit BELOW current, which should fail
        const limitPrice = expandDecimals(39999, 18)

        const tx = script.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, true, collateralDelta, limitPrice)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: collateralDelta,
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        const result = tx.call().then(({ waitForResult }) => waitForResult())

        await expect(result).rejects.toThrowError("VaultPriceSlippageExceeded")
    })

    it("fails when BTC price rises above the limit price", async () => {
        const script = new IncreasePositionScript(user0)
        script.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })

        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        // Initial price is 40_000; set limit to 40_000, then move price up so it exceeds the limit
        const limitPrice = expandDecimals(40_000, 18)
        await call(storkMock.functions.update_price(BTC_ASSET, expandDecimals(40001, 18)))

        const tx = script.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, true, collateralDelta, limitPrice)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: collateralDelta,
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        const result = tx.call().then(({ waitForResult }) => waitForResult())

        await expect(result).rejects.toThrowError("VaultPriceSlippageExceeded")
    })

    it("calls increase-position-script successfully for a short position", async () => {
        const script = new IncreasePositionScript(user0)
        script.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })

        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        // Current BTC price is 40_000; for a short, require price >= limit, so pick a slightly lower limit.
        const limitPrice = expandDecimals(39_999, 18)

        const tx = script.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, false, collateralDelta, limitPrice)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: collateralDelta,
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        const { waitForResult } = await tx.call()
        await waitForResult()

        const positionKey = (await vault.functions.get_position_key(user0Identity, BTC_ASSET, false).get()).value
        const position = (await vault.functions.get_position_by_key(positionKey).get()).value

        expect(position.size.toString()).eq(sizeDelta)
        expect(!position.collateral.isZero()).eq(true)
    })

    it("fails for a short when current BTC price is below the limit price", async () => {
        const script = new IncreasePositionScript(user0)
        script.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })

        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        // Current BTC price is 40_000; set limit ABOVE current, which should fail for a short
        const limitPrice = expandDecimals(40_001, 18)

        const tx = script.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, false, collateralDelta, limitPrice)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: collateralDelta,
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        const result = tx.call().then(({ waitForResult }) => waitForResult())

        await expect(result).rejects.toThrowError("VaultPriceSlippageExceeded")
    })

    it("fails for a short when BTC price falls below the limit price", async () => {
        const script = new IncreasePositionScript(user0)
        script.setConfigurableConstants({
            VAULT: { bits: vault.id.toHexString() },
            BASE_ASSET_ID: { bits: USDC_ASSET_ID },
        })

        const collateralDelta = expandDecimals(400)
        const sizeDelta = expandDecimals(10000)
        // Initial price is 40_000; set limit to 40_000, then move price down so it is below the limit
        const limitPrice = expandDecimals(40_000, 18)
        await call(storkMock.functions.update_price(BTC_ASSET, expandDecimals(39_999, 18)))

        const tx = script.functions
            .main(user0Identity, BTC_ASSET, sizeDelta, false, collateralDelta, limitPrice)
            .assembleTxParams({
                feePayerAccount: user0,
                accountCoinQuantities: [
                    {
                        amount: collateralDelta,
                        assetId: USDC_ASSET_ID,
                        account: user0,
                        changeOutputAccount: user0,
                    },
                ],
            })
        const result = tx.call().then(({ waitForResult }) => waitForResult())

        await expect(result).rejects.toThrowError("VaultPriceSlippageExceeded")
    })

    afterEach(async () => {
        launchedNode.cleanup()
    })
})

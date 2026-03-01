import { Provider, Wallet, createAssetId } from 'fuels';
import { StorkMock, TestnetToken, Vault } from '../../contracts/types/index.js';
import {
  BTC_ASSET,
  DEFAULT_SUB_ID,
  DEPLOYER_PK,
  ETH_ASSET,
  USDC_ASSET,
  USER_0_PK,
  USER_1_PK,
  call,
  expandDecimals,
  moveBlockchainTime,
  toPrice,
  walletToAddressIdentity,
} from './utils.js';

const graphQLUrl = 'http://127.0.0.1:4000/v1/graphql';

if (import.meta.url === `file://${process.argv[1]}`) {
  populateEvents()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

async function populateEvents() {
  const mockPricefeedAddress = process.env.MOCK_STORK_CONTRACT;
  const vaultAddress = process.env.VAULT_CONTRACT;
  const pricefeedWrapperAddress = process.env.PRICEFEED_WRAPPER_CONTRACT;
  const usdcAddress = process.env.USDC_CONTRACT;

  if (!mockPricefeedAddress || !vaultAddress || !pricefeedWrapperAddress || !usdcAddress) {
    throw new Error(
      'Missing required environment variables: MOCK_STORK_CONTRACT, VAULT_CONTRACT, PRICEFEED_WRAPPER_CONTRACT, USDC_CONTRACT'
    );
  }

  const provider = new Provider(graphQLUrl);

  const deployerWallet = Wallet.fromPrivateKey(DEPLOYER_PK, provider);
  const user0Wallet = Wallet.fromPrivateKey(USER_0_PK, provider);
  const user1Wallet = Wallet.fromPrivateKey(USER_1_PK, provider);

  const user0Identity = walletToAddressIdentity(user0Wallet);
  const user1Identity = walletToAddressIdentity(user1Wallet);

  const storkMockDeployer = new StorkMock(mockPricefeedAddress, deployerWallet);
  const vaultDeployer = new Vault(vaultAddress, deployerWallet);
  const vaultUser0 = new Vault(vaultAddress, user0Wallet);
  const vaultUser1 = new Vault(vaultAddress, user1Wallet);
  const usdcUser0 = new TestnetToken(usdcAddress, user0Wallet);
  const usdcUser1 = new TestnetToken(usdcAddress, user1Wallet);

  const attachedContracts = [vaultAddress, pricefeedWrapperAddress, mockPricefeedAddress];
  const USDC_ASSET_ID = createAssetId(usdcAddress, DEFAULT_SUB_ID).bits;

  await call(
    vaultDeployer.functions.set_fees(
      30, // liquidity_fee_basis_points
      10, // increase_position_fee_basis_points
      0, // decrease_position_fee_basis_points
      10 // liquidation_fee_basis_points
    )
  );
  await call(vaultDeployer.functions.set_asset_config(BTC_ASSET, 50 * 10_000));
  await call(vaultDeployer.functions.set_asset_config(ETH_ASSET, 50 * 10_000));

  await call(usdcUser0.functions.faucet());
  await call(usdcUser1.functions.faucet());

  await call(storkMockDeployer.functions.update_price(USDC_ASSET, toPrice(1)));
  await call(storkMockDeployer.functions.update_price(BTC_ASSET, toPrice(40000)));
  await call(storkMockDeployer.functions.update_price(ETH_ASSET, toPrice(3000)));
  await moveBlockchainTime(provider, 2, 1);

  await call(
    vaultUser0.functions
      .add_liquidity(user0Identity)
      .addContracts(attachedContracts)
      .callParams({
        forward: [expandDecimals(40000), USDC_ASSET_ID],
      })
  );
  await moveBlockchainTime(provider, 5, 1);

  // User0: long BTC. User1: short BTC.
  await call(
    vaultUser0.functions
      .increase_position(user0Identity, BTC_ASSET, expandDecimals(1000), true)
      .addContracts(attachedContracts)
      .callParams({
        forward: [expandDecimals(100), USDC_ASSET_ID],
      })
  );
  await call(
    vaultUser1.functions
      .increase_position(user1Identity, BTC_ASSET, expandDecimals(1000), false)
      .addContracts(attachedContracts)
      .callParams({
        forward: [expandDecimals(100), USDC_ASSET_ID],
      })
  );
  await moveBlockchainTime(provider, 10, 1);

  // Drop BTC price: long becomes liquidatable, short stays healthy.
  await call(storkMockDeployer.functions.update_price(BTC_ASSET, toPrice(36000)));
  await moveBlockchainTime(provider, 3, 1);

  // User0: long ETH. User1: short ETH.
  await call(
    vaultUser0.functions
      .increase_position(user0Identity, ETH_ASSET, expandDecimals(1000), true)
      .addContracts(attachedContracts)
      .callParams({
        forward: [expandDecimals(100), USDC_ASSET_ID],
      })
  );
  await call(
    vaultUser1.functions
      .increase_position(user1Identity, ETH_ASSET, expandDecimals(1000), false)
      .addContracts(attachedContracts)
      .callParams({
        forward: [expandDecimals(100), USDC_ASSET_ID],
      })
  );
  await moveBlockchainTime(provider, 8, 1);

  // Drop ETH price: long becomes liquidatable, short stays healthy.
  await call(storkMockDeployer.functions.update_price(ETH_ASSET, toPrice(2750)));
  await moveBlockchainTime(provider, 3, 1);

  // Do not liquidate – we need open positions to verify state vs validate_liquidation.
}

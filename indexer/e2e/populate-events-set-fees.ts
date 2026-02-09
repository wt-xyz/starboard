import { Provider, Wallet } from 'fuels';
import { Vault } from '../../contracts/types/index.js';
import { DEPLOYER_PK, call } from './utils.js';

// graphql url is hardcoded, taken from the fuel node starting script
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
  const vaultAddress = process.env.VAULT_CONTRACT;

  if (!vaultAddress) {
    throw new Error('Missing required environment variable: VAULT_CONTRACT');
  }

  const provider = new Provider(graphQLUrl);

  // preparation, usually the same for all the populate scripts
  const deployerWallet = Wallet.fromPrivateKey(DEPLOYER_PK, provider);

  const vaultDeployer = new Vault(vaultAddress, deployerWallet);

  // custom code, populate the events: two different SetFees calls
  await call(
    vaultDeployer.functions.set_fees(
      30, // liquidity_fee_basis_points
      10, // increase_position_fee_basis_points
      0, // decrease_position_fee_basis_points
      10 // liquidation_fee_basis_points
    )
  );

  await call(
    vaultDeployer.functions.set_fees(
      40, // liquidity_fee_basis_points
      15, // increase_position_fee_basis_points
      5, // decrease_position_fee_basis_points
      20 // liquidation_fee_basis_points
    )
  );
}

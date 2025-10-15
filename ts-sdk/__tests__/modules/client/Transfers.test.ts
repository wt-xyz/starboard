import Long from 'long';
import { DYDX_TEST_MNEMONIC } from '../../../examples/constants';
import { BECH32_PREFIX } from '../../../src';
import { Network } from '../../../src/clients/constants';
import { ValidatorClient } from '../../../src/clients/validator-client';

import LocalWallet from '../../../src/clients/modules/local-wallet';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Validator Client', () => {
  let account: LocalWallet;
  let client: ValidatorClient;

  describe('Transfers', () => {
    beforeEach(async () => {
      account = await LocalWallet.fromMnemonic(DYDX_TEST_MNEMONIC, BECH32_PREFIX);
      client = await ValidatorClient.connect(Network.testnet().validatorConfig);
      await sleep(3_000); // Wait for withdraw to finalize
    });

    it('Withdraw', async () => {
      const tx = await client.post.withdraw(account, 0, new Long(1_00_000_000));
      console.log('**Withdraw Tx**');
      console.log(tx);
    });

    it('Deposit', async () => {
      const tx = await client.post.deposit(account, 0, new Long(1_000_000));
      console.log('**Deposit Tx**');
      console.log(tx);
    });

    it('Transfer', async () => {
      const tx = await client.post.transfer(account, account.address, 1, 0, new Long(1_000));
      console.log('**Transfer Tx**');
      console.log(tx);
    });
  });
});

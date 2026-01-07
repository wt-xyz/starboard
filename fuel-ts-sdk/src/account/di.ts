import type { StoreService } from '@/shared/lib/store-service';
import * as Wallet from './src/wallet';

export const accountReducer = {
  wallet: Wallet.walletReducer,
  // Future: balances: Balances.balancesReducer,
};

export interface AccountThunkExtras {
  walletConnectorRepository: Wallet.WalletConnectorRepository;
  // Future: balanceRepository: Balances.BalanceRepository;
}

export const createAccountModule = () => {
  return {
    getThunkExtras: (): AccountThunkExtras => ({
      walletConnectorRepository: Wallet.walletAdapters.createFuelWalletConnectorRepository(),
    }),

    createCommandsAndQueries: (storeService: StoreService, thunkExtras: AccountThunkExtras) => {
      const walletCommands = Wallet.createWalletCommands(
        storeService,
        thunkExtras.walletConnectorRepository
      );
      const walletQueries = Wallet.createWalletQueries(
        storeService,
        thunkExtras.walletConnectorRepository
      );

      return {
        wallet: {
          ...walletCommands,
          ...walletQueries,
        },
        // Future: balances: { ... }
      };
    },
  };
};

export type AccountModule = ReturnType<typeof createAccountModule>;


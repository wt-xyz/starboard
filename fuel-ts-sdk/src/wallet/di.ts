import type { StoreService } from '@/shared/lib/store-service';
import { createWalletCommands } from './src/application/commands';
import { createWalletQueries } from './src/application/queries';
import { walletAdapters, walletReducer } from './src/infrastructure';
import type { WalletConnectorRepository } from './src/domain';

export { walletReducer };

export interface WalletThunkExtra {
  walletConnectorRepository: WalletConnectorRepository;
}

export const createWalletModule = () => {
  return {
    getThunkExtras: (): WalletThunkExtra => ({
      walletConnectorRepository: walletAdapters.createFuelWalletConnectorRepository(),
    }),

    createCommandsAndQueries: (
      storeService: StoreService,
      thunkExtras: WalletThunkExtra
    ) => {
      const commands = createWalletCommands(
        storeService,
        thunkExtras.walletConnectorRepository
      );
      const queries = createWalletQueries(
        storeService,
        thunkExtras.walletConnectorRepository
      );

      return {
        ...commands,
        ...queries,
      };
    },
  };
};

export type WalletModule = ReturnType<typeof createWalletModule>;

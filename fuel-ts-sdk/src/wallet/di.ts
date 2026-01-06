import type { StoreService } from '@/shared/lib/store-service';
import { createWalletCommands } from './application/commands';
import { createWalletQueries } from './application/queries';
import { walletReducer } from './infrastructure';

export { walletReducer };

export const createWalletModule = () => {
  return {
    createCommandsAndQueries: (storeService: StoreService) => {
      const commands = createWalletCommands(storeService);
      const queries = createWalletQueries(storeService);

      return {
        ...commands,
        ...queries,
      };
    },
  };
};

export type WalletModule = ReturnType<typeof createWalletModule>;


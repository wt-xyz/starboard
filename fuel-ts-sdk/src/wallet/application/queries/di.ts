import type { StoreService } from '@/shared/lib/store-service';
import { createGetIsConnected } from './get-is-connected';
import { createGetWalletAddress } from './get-wallet-address';

export const createWalletQueries = (storeService: StoreService) => ({
  getWalletAddress: createGetWalletAddress(storeService),
  getIsWalletConnected: createGetIsConnected(storeService),
});

export type WalletQueries = ReturnType<typeof createWalletQueries>;


import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { createGetAvailableConnectors } from './get-available-connectors';
import { createGetIsConnected } from './get-is-connected';
import { createGetIsConnecting } from './get-is-connecting';
import { createGetWalletAddress } from './get-wallet-address';

export const createWalletQueries = (
  storeService: StoreService,
  repository: WalletConnectorRepository
) => ({
  getAvailableConnectors: createGetAvailableConnectors(repository),
  getWalletAddress: createGetWalletAddress(storeService),
  isConnected: createGetIsConnected(storeService),
  isConnecting: createGetIsConnecting(storeService),
});

export type WalletQueries = ReturnType<typeof createWalletQueries>;


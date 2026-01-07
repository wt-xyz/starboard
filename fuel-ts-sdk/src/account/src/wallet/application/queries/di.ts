import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { createGetAvailableConnectors } from './get-available-connectors';
import { createGetCurrentNetwork } from './get-current-network';
import { createGetIsConnected } from './get-is-connected';
import { createGetIsConnecting } from './get-is-connecting';
import { createGetUserBalances } from './get-user-balances';
import { createGetWalletAccount } from './get-wallet-account';
import { createGetWalletAddress } from './get-wallet-address';

export const createWalletQueries = (
  storeService: StoreService,
  repository: WalletConnectorRepository
) => ({
  // Connection status (from Redux)
  getWalletAddress: createGetWalletAddress(storeService),
  isConnected: createGetIsConnected(storeService),
  isConnecting: createGetIsConnecting(storeService),

  // Connector info (from repository)
  getAvailableConnectors: createGetAvailableConnectors(repository),

  // Account data (from repository)
  getUserBalances: createGetUserBalances(repository),
  getWalletAccount: createGetWalletAccount(repository),

  // Network (from repository)
  getCurrentNetwork: createGetCurrentNetwork(repository),
});

export type WalletQueries = ReturnType<typeof createWalletQueries>;


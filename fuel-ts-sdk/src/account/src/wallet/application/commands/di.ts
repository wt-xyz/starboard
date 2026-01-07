import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { createChangeNetworkCommand } from './change-network.command';
import { createDisconnectCommand } from './disconnect.command';
import { createEstablishConnectionCommand } from './establish-connection.command';

export const createWalletCommands = (
  storeService: StoreService,
  repository: WalletConnectorRepository
) => ({
  // Connection management
  establishConnection: createEstablishConnectionCommand(storeService, repository),
  disconnect: createDisconnectCommand(storeService, repository),

  // Network management
  changeNetwork: createChangeNetworkCommand(repository),
});

export type WalletCommands = ReturnType<typeof createWalletCommands>;


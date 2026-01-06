import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { createEstablishConnectionCommand } from './establish-connection.command';
import { createDisconnectCommand } from './disconnect.command';

export const createWalletCommands = (
  storeService: StoreService,
  repository: WalletConnectorRepository
) => ({
  establishConnection: createEstablishConnectionCommand(storeService, repository),
  disconnect: createDisconnectCommand(storeService, repository),
});

export type WalletCommands = ReturnType<typeof createWalletCommands>;


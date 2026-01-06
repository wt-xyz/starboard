import type { StoreService } from '@/shared/lib/store-service';
import { createOnWalletConnectedCommand } from './on-wallet-connected.command';
import { createOnWalletDisconnectedCommand } from './on-wallet-disconnected.command';

export const createWalletCommands = (storeService: StoreService) => ({
  onWalletConnected: createOnWalletConnectedCommand(storeService),
  onWalletDisconnected: createOnWalletDisconnectedCommand(storeService),
});

export type WalletCommands = ReturnType<typeof createWalletCommands>;


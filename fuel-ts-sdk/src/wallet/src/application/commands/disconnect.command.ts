import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { selectWalletConnectorId, setDisconnected } from '../../infrastructure';

/**
 * Disconnect command always updates local state regardless of remote errors.
 * This is intentional: the user's intent to disconnect should be honored locally
 * even if the wallet provider fails to process the disconnect request.
 */
export const createDisconnectCommand =
  (store: StoreService, repository: WalletConnectorRepository) => async (): Promise<void> => {
    const state = store.getState();
    const connectorId = selectWalletConnectorId(state);

    try {
      if (connectorId) {
        await repository.disconnect(connectorId);
      }
    } finally {
      // Always clear local state - user intent to disconnect is honored
      store.dispatch(setDisconnected());
    }
  };

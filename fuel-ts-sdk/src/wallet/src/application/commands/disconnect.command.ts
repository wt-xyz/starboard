import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { setDisconnected, selectWalletConnectorId } from '../../infrastructure';

export const createDisconnectCommand =
  (store: StoreService, repository: WalletConnectorRepository) =>
  async (): Promise<void> => {
    const state = store.getState();
    const connectorId = selectWalletConnectorId(state);

    if (connectorId) {
      await repository.disconnect(connectorId);
    }

    store.dispatch(setDisconnected());
  };


import type { StoreService } from '@/shared/lib/store-service';
import type { WalletConnectorRepository } from '../../domain';
import { setConnecting, setConnected, setError } from '../../infrastructure';

export const createEstablishConnectionCommand =
  (store: StoreService, repository: WalletConnectorRepository) =>
  async (connectorId: string): Promise<void> => {
    store.dispatch(setConnecting(true));

    try {
      const connection = await repository.connect(connectorId);

      store.dispatch(
        setConnected({
          address: connection.address,
          connectorId: connection.connectorId,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      store.dispatch(setError(message));
      throw error;
    }
  };


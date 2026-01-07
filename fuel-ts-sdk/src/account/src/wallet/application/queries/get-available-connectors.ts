import type { ConnectorInfo, WalletConnectorRepository } from '../../domain';

export const createGetAvailableConnectors =
  (repository: WalletConnectorRepository) => async (): Promise<ConnectorInfo[]> => {
    return repository.getAvailableConnectors();
  };

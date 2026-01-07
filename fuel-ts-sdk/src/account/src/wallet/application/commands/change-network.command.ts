import type { Network as FuelsNetwork } from 'fuels';
import type { WalletConnectorRepository } from '../../domain';

export const createChangeNetworkCommand =
  (repository: WalletConnectorRepository) =>
  async (network: FuelsNetwork): Promise<void> => {
    await repository.changeNetwork(network);
  };


import type { Network as FuelsNetwork } from 'fuels';
import type { WalletConnectorRepository } from '@/account';

export const createGetCurrentNetwork =
  (repository: WalletConnectorRepository) => (): Promise<FuelsNetwork> =>
    repository.getCurrentNetwork();

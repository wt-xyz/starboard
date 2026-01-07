import type { WalletConnectorRepository } from '@/account';
import type { AssetId } from '@/shared/types';

export const createGetUserBalances =
  (repository: WalletConnectorRepository) => (): Promise<Record<AssetId, bigint>> =>
    repository.getUserBalances();

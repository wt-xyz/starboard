import type { AssetId } from '@/shared/types';
import type { WalletConnectorRepository } from '@/account';

export const createGetUserBalances =
  (repository: WalletConnectorRepository) => (): Promise<Record<AssetId, bigint>> =>
    repository.getUserBalances();


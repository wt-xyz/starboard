import type { StoreService } from '@sdk/shared/lib/StoreService';
import { $decimalValue } from '@sdk/shared/models/DecimalValue';
import type { AssetId } from '@sdk/shared/types';
import { marketStatsSelectors } from '../../infrastructure';

interface GetAssetVolume24hQueryDependencies {
  storeService: StoreService;
}

export const createGetAssetVolume24hQuery =
  (deps: GetAssetVolume24hQueryDependencies) =>
  (assetId: AssetId): number | null => {
    const state = deps.storeService.getState();
    const stats = marketStatsSelectors.selectById(state, assetId);

    if (!stats) return null;

    return $decimalValue(stats.volume24h).toFloat();
  };

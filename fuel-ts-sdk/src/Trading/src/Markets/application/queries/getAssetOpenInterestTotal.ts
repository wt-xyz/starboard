import type { StoreService } from '@sdk/shared/lib/StoreService';
import { $decimalValue } from '@sdk/shared/models/DecimalValue';
import type { AssetId } from '@sdk/shared/types';
import { DecimalCalculator } from '@sdk/shared/utils/DecimalCalculator';
import { marketStatsSelectors } from '../../infrastructure';

interface GetAssetOpenInterestTotalQueryDependencies {
  storeService: StoreService;
}

export const createGetAssetOpenInterestTotalQuery =
  (deps: GetAssetOpenInterestTotalQueryDependencies) =>
  (assetId: AssetId): number | null => {
    const state = deps.storeService.getState();
    const stats = marketStatsSelectors.selectById(state, assetId);

    if (!stats) return null;

    const total = DecimalCalculator.value(stats.openInterestLong)
      .add(stats.openInterestShort)
      .calculate();

    return $decimalValue(total).toFloat();
  };

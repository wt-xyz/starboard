import type { StoreService } from '@sdk/shared/lib/StoreService';
import { $decimalValue } from '@sdk/shared/models/DecimalValue';
import type { AssetId } from '@sdk/shared/types';
import { DecimalCalculator } from '@sdk/shared/utils/DecimalCalculator';
import { selectAssetPricesByAssetId } from '../../infrastructure';

interface GetAssetPriceChange24hQueryDependencies {
  storeService: StoreService;
}

export const createGetAssetPriceChange24hQuery =
  (deps: GetAssetPriceChange24hQueryDependencies) =>
  (assetId: AssetId): number | null => {
    const state = deps.storeService.getState();
    const prices = selectAssetPricesByAssetId(state, assetId);

    const currentPrice = prices.at(0);
    const price24hAgo = prices.at(-1);

    if (!currentPrice || !price24hAgo || currentPrice === price24hAgo) return null;
    if (price24hAgo.value.value === '0') return null;

    const result = DecimalCalculator.value(currentPrice.value)
      .subtractBy(price24hAgo.value)
      .divideBy(price24hAgo.value)
      .calculate();

    return $decimalValue(result).toFloat();
  };

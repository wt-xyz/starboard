import type { StoreService } from '@sdk/shared/lib/StoreService';
import { $decimalValue } from '@sdk/shared/models/DecimalValue';
import { OraclePrice } from '@sdk/shared/models/decimals';
import type { AssetId } from '@sdk/shared/types';
import {
  selectAssetPricesByAssetId,
  selectCandlesByAssetAndInterval,
} from '../../infrastructure';

interface GetAssetPriceChange24hQueryDependencies {
  storeService: StoreService;
}

export const createGetAssetPriceChange24hQuery =
  (deps: GetAssetPriceChange24hQueryDependencies) =>
  (assetId: AssetId): number | null => {
    const state = deps.storeService.getState();
    const currentPrice = selectAssetPricesByAssetId(state, assetId).at(0);
    const candles = selectCandlesByAssetAndInterval(state, assetId, 'D1');

    const latestCandle = candles.at(-1);
    if (!currentPrice || !latestCandle) return null;

    const current = $decimalValue(currentPrice.value).toFloat();
    const old = $decimalValue(OraclePrice.fromBigIntString(latestCandle.openPrice)).toFloat();

    if (old === 0) return null;
    return (current - old) / old;
  };

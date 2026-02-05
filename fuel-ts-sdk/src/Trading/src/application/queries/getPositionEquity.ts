import { multimemo } from '@sdk/shared/lib/memo';
import { UsdValue } from '@sdk/shared/models/decimals';
import type { AssetId, PositionStableId } from '@sdk/shared/types';
import { DecimalCalculator, zero } from '@sdk/shared/utils/DecimalCalculator';
import type { MarketQueries } from '../../Markets';
import type { PositionsQueries } from '../../Positions';
import { calculateUnrealizedPnl } from '../../Positions';

export interface GetPositionEquityQueryDependencies {
  positionsQueries: PositionsQueries;
  marketQueries: MarketQueries;
}

export const createGetPositionEquityQuery = (deps: GetPositionEquityQueryDependencies) => {
  const positionGetter = (positionStableId: PositionStableId) =>
    deps.positionsQueries.getPositionById(positionStableId);

  const priceGetter = (assetId: AssetId | undefined) =>
    assetId ? deps.marketQueries.getAssetLatestPrice(assetId) : null;

  const getPositionEquity = multimemo(
    (position: ReturnType<typeof positionGetter>, markPrice: ReturnType<typeof priceGetter>) => {
      if (!position || !markPrice) return zero(UsdValue);

      const pnl = calculateUnrealizedPnl(position, markPrice.value);
      return DecimalCalculator.value(position.collateral).add(pnl).calculate(UsdValue);
    }
  );

  return (positionStableId: PositionStableId) => {
    const position = positionGetter(positionStableId);
    const markPrice = priceGetter(position?.assetId);
    return getPositionEquity(position, markPrice);
  };
};

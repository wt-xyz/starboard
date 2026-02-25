import type { GetAccountOpenPositionsQueryDeps } from './getCurrentAccountOpenPositions';
import { createGetCurrentAccountOpenPositionsQuery } from './getCurrentAccountOpenPositions';
import type { GetCurrentAccountPositionRevisionsQueryDeps } from './getCurrentAccountPositionRevisions';
import { createGetCurrentAccountPositionRevisionsQuery } from './getCurrentAccountPositionRevisions';
import type { GetCurrentAccountTotalExposureQueryDependencies } from './getCurrentAccountTotalExposure';
import { createGetCurrentAccountTotalExposureQuery } from './getCurrentAccountTotalExposure';
import type { GetPositionEquityQueryDependencies } from './getPositionEquity';
import { createGetPositionEquityQuery } from './getPositionEquity';
import type { GetPositionLiquidationPriceApproxQueryDependencies } from './getPositionLiquidationPriceApprox';
import { createGetPositionLiquidationPriceApproxQuery } from './getPositionLiquidationPriceApprox';

export type TradingQueriesDependencies = GetAccountOpenPositionsQueryDeps &
  GetCurrentAccountPositionRevisionsQueryDeps &
  GetCurrentAccountTotalExposureQueryDependencies &
  GetPositionEquityQueryDependencies &
  GetPositionLiquidationPriceApproxQueryDependencies;

export function createTradingQueries(deps: TradingQueriesDependencies) {
  return {
    getCurrentAccountOpenPositions: createGetCurrentAccountOpenPositionsQuery(deps),
    getCurrentAccountPositionRevisions: createGetCurrentAccountPositionRevisionsQuery(deps),
    getCurrentAccountTotalExposure: createGetCurrentAccountTotalExposureQuery(deps),
    getPositionEquity: createGetPositionEquityQuery(deps),
    getPositionLiquidationPriceApprox: createGetPositionLiquidationPriceApproxQuery(deps),
  };
}

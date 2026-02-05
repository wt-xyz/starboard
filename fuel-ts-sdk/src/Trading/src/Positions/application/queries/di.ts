import type { GetAllPositionsQueryDependencies } from './getAllPositions';
import { createGetAllLatestPositionsQuery } from './getAllPositions';
import type { GetPositionLeverageQueryDependencies } from './getPositionLeverage';
import { createGetPositionLeverageQuery } from './getPositionLeverage';
import type { GetPositionSizeInQuoteAssetQueryDependencies } from './getPositionSizeInQuoteAsset';
import { createGetPositionSizeInQuoteAssetQuery } from './getPositionSizeInQuoteAsset';
import type { GetPositionByIdQueryDependencies } from './getPositionsById';
import { createGetPositionByIdQuery } from './getPositionsById';
import type { IsPositionOpenQueryDependencies } from './isPositionOpen';
import { createIsPositionOpenQuery } from './isPositionOpen';

export type PositionsQueriesDependencies = GetAllPositionsQueryDependencies &
  GetPositionByIdQueryDependencies &
  IsPositionOpenQueryDependencies &
  GetPositionSizeInQuoteAssetQueryDependencies &
  GetPositionLeverageQueryDependencies;

export const createPositionQueries = (deps: PositionsQueriesDependencies) => ({
  getPositionById: createGetPositionByIdQuery(deps),
  isPositionOpen: createIsPositionOpenQuery(deps),
  getAllLatestPositions: createGetAllLatestPositionsQuery(deps),
  getPositionSizeInQuoteAsset: createGetPositionSizeInQuoteAssetQuery(deps),
  getPositionLeverage: createGetPositionLeverageQuery(deps),
});

export type PositionsQueries = ReturnType<typeof createPositionQueries>;

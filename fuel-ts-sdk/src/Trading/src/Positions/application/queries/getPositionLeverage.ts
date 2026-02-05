import type { StoreService } from '@sdk/shared/lib/StoreService';
import { multimemo } from '@sdk/shared/lib/memo';
import { DecimalValue } from '@sdk/shared/models/DecimalValue';
import type { PositionStableId } from '@sdk/shared/types';
import { zero } from '@sdk/shared/utils/DecimalCalculator';
import { calculateLeverage } from '../../domain';
import { selectLatestPositionByStableId } from '../../infrastructure';

export interface GetPositionLeverageQueryDependencies {
  storeService: StoreService;
}

export const createGetPositionLeverageQuery = (deps: GetPositionLeverageQueryDependencies) => {
  const positionGetter = (id: PositionStableId) =>
    deps.storeService.select((s) => selectLatestPositionByStableId(s, id));

  const getPositionLeverage = multimemo((position: ReturnType<typeof positionGetter>) => {
    if (!position) return zero(DecimalValue);
    return calculateLeverage(position);
  });

  return (positionId: PositionStableId) => getPositionLeverage(positionGetter(positionId));
};

import type { StoreService } from '@sdk/shared/lib/StoreService';
import { selectAllPositions } from '../../infrastructure';

export interface GetAllPositionRevisionsQueryDependencies {
  storeService: StoreService;
}

export const createGetAllPositionRevisionsQuery = (
  deps: GetAllPositionRevisionsQueryDependencies
) => {
  return () => deps.storeService.select(selectAllPositions);
};

import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { FundingInfoEntity } from '../../domain';
import { selectFundingInfoByAssetId, selectWatchedAssetId } from '../../infrastructure';

export interface GetWatchedAssetFundingInfoQueryDependencies {
  storeService: StoreService;
}

export const createGetWatchedAssetFundingInfoQuery =
  (deps: GetWatchedAssetFundingInfoQueryDependencies) => (): FundingInfoEntity | undefined => {
    const watchedAssetId = deps.storeService.select(selectWatchedAssetId);
    if (!watchedAssetId) return;

    return deps.storeService.select((state) => selectFundingInfoByAssetId(state, watchedAssetId));
  };

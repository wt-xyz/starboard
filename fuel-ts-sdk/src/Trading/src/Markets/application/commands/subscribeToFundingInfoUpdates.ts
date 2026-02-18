import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import type { AssetId } from '@sdk/shared/types';
import { AssetFundingInfoUpdatedEvent } from '../../domain';
import type { AssetFundingInfoUpdatedEventPayload } from '../../domain';
import { asyncFetchCurrentFundingInfoThunk, subscriptions } from '../../infrastructure';

export interface SyncFundingInfoDependencies {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
}

export const createSyncFundingInfoCommands = (deps: SyncFundingInfoDependencies) => {
  const fundingInfoUpdateHandler = (payload: AssetFundingInfoUpdatedEventPayload) => {
    deps.storeService.dispatch(AssetFundingInfoUpdatedEvent(payload));
  };

  return {
    syncFundingInfo: (assetId: AssetId) => {
      deps.storeService.dispatch(asyncFetchCurrentFundingInfoThunk(assetId));
      deps.subscriptionService.subscribe(
        subscriptions.CurrentFundingInfoUpdated(assetId),
        fundingInfoUpdateHandler
      );
    },
    desyncFundingInfo: (assetId: AssetId) => {
      deps.subscriptionService.unsubscribe(
        subscriptions.CurrentFundingInfoUpdated(assetId),
        fundingInfoUpdateHandler
      );
    },
  };
};

export type SyncFundingInfoCommands = ReturnType<typeof createSyncFundingInfoCommands>;

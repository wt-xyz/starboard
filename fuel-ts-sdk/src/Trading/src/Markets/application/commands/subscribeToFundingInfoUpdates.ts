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
  const refCounts = new Map<AssetId, number>();

  const fundingInfoUpdateHandler = (payload: AssetFundingInfoUpdatedEventPayload) => {
    deps.storeService.dispatch(AssetFundingInfoUpdatedEvent(payload));
  };

  return {
    syncFundingInfo: (assetId: AssetId) => {
      const count = refCounts.get(assetId) ?? 0;
      refCounts.set(assetId, count + 1);
      if (count === 0) {
        deps.storeService.dispatch(asyncFetchCurrentFundingInfoThunk(assetId));
        deps.subscriptionService.subscribe(
          subscriptions.CurrentFundingInfoUpdated(assetId),
          fundingInfoUpdateHandler
        );
      }
    },
    desyncFundingInfo: (assetId: AssetId) => {
      const count = refCounts.get(assetId) ?? 0;
      if (count <= 1) {
        refCounts.delete(assetId);
        deps.subscriptionService.unsubscribe(
          subscriptions.CurrentFundingInfoUpdated(assetId),
          fundingInfoUpdateHandler
        );
      } else {
        refCounts.set(assetId, count - 1);
      }
    },
  };
};

export type SyncFundingInfoCommands = ReturnType<typeof createSyncFundingInfoCommands>;

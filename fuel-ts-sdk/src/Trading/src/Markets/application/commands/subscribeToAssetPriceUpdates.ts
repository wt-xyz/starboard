import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import type { AssetId } from '@sdk/shared/types';
import { AssetPriceUpdatedEvent } from '../../domain';
import type { AssetPriceUpdatedEventPayload } from '../../domain';
import {
  asyncFetchAssetPrice24hAgoThunk,
  asyncFetchCurrentAssetPricesThunk,
  subscriptions,
} from '../../infrastructure';

export interface SyncAssetPriceDependencies {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
}

export const createSyncAssetPriceCommands = (deps: SyncAssetPriceDependencies) => {
  const refCounts = new Map<AssetId, number>();

  const assetPriceUpdateHandler = (payload: AssetPriceUpdatedEventPayload) => {
    deps.storeService.dispatch(AssetPriceUpdatedEvent(payload));
  };

  return {
    syncAssetPrice: (assetId: AssetId) => {
      const count = refCounts.get(assetId) ?? 0;
      refCounts.set(assetId, count + 1);
      if (count === 0) {
        deps.storeService.dispatch(asyncFetchCurrentAssetPricesThunk(assetId));
        deps.storeService.dispatch(asyncFetchAssetPrice24hAgoThunk(assetId));
        deps.subscriptionService.subscribe(
          subscriptions.AssetPriceUpdated(assetId),
          assetPriceUpdateHandler
        );
      }
    },
    desyncAssetPrice: (assetId: AssetId) => {
      const count = refCounts.get(assetId) ?? 0;
      if (count <= 1) {
        refCounts.delete(assetId);
        deps.subscriptionService.unsubscribe(
          subscriptions.AssetPriceUpdated(assetId),
          assetPriceUpdateHandler
        );
      } else {
        refCounts.set(assetId, count - 1);
      }
    },
  };
};

export type SyncAssetPriceCommands = ReturnType<typeof createSyncAssetPriceCommands>;

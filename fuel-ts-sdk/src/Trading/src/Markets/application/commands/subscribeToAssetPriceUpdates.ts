import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import type { AssetId } from '@sdk/shared/types';
import type { AssetPriceEntity } from '../../domain';
import { assetPricesActions, subscriptions } from '../../infrastructure';

interface SubscribeToAssetPriceCommandsDependencies {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
}

export const createSubscribeToAssetPriceCommands = (
  deps: SubscribeToAssetPriceCommandsDependencies
) => {
  const assetPriceUpdateHandler = (entity: AssetPriceEntity) => {
    deps.storeService.dispatch(assetPricesActions.assetPriceReceived(entity));
  };

  return {
    subscribeToAssetPriceUpdates: (assetId: AssetId) => {
      deps.subscriptionService.subscribe(
        subscriptions.AssetPriceUpdated(assetId),
        assetPriceUpdateHandler
      );
    },
    unsubscribeFromAssetPriceUpdates: (assetId: AssetId) => {
      deps.subscriptionService.unsubscribe(
        subscriptions.AssetPriceUpdated(assetId),
        assetPriceUpdateHandler
      );
    },
  };
};

export type SubscribeToAssetPriceCommands = ReturnType<typeof createSubscribeToAssetPriceCommands>;

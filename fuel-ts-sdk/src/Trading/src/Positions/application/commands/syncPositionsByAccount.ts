import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import type { Address } from '@sdk/shared/types';
import type { PositionChangedEventPayload } from '../../domain';
import { PositionChangedEvent } from '../../domain';
import { positionsApi, subscriptions } from '../../infrastructure';

export interface SyncPositionsByAccountDependencies {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
}

export const createSyncPositionsByAccountCommands = (deps: SyncPositionsByAccountDependencies) => {
  const positionUpdateHandler = (payload: PositionChangedEventPayload) => {
    deps.storeService.dispatch(PositionChangedEvent(payload));
    deps.storeService.dispatch(
      positionsApi.endpoints.getPositionsByAddress.initiate(payload.account, {
        forceRefetch: true,
      })
    );
  };

  return {
    syncPositionsByAccount: (account: Address) => {
      deps.storeService.dispatch(
        positionsApi.endpoints.getPositionsByAddress.initiate(account, { forceRefetch: true })
      );
      deps.subscriptionService.subscribe(
        subscriptions.CurrentPositionUpdated(account),
        positionUpdateHandler
      );
    },
    desyncPositionsByAccount: (account: Address) => {
      deps.subscriptionService.unsubscribe(
        subscriptions.CurrentPositionUpdated(account),
        positionUpdateHandler
      );
    },
  };
};

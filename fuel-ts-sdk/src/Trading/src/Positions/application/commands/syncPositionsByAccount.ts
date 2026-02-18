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
  const refCounts = new Map<Address, number>();

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
      const count = refCounts.get(account) ?? 0;
      refCounts.set(account, count + 1);
      if (count === 0) {
        deps.storeService.dispatch(
          positionsApi.endpoints.getPositionsByAddress.initiate(account, { forceRefetch: true })
        );
        deps.subscriptionService.subscribe(
          subscriptions.CurrentPositionUpdated(account),
          positionUpdateHandler
        );
      }
    },
    desyncPositionsByAccount: (account: Address) => {
      const count = refCounts.get(account) ?? 0;
      if (count <= 1) {
        refCounts.delete(account);
        deps.subscriptionService.unsubscribe(
          subscriptions.CurrentPositionUpdated(account),
          positionUpdateHandler
        );
      } else {
        refCounts.set(account, count - 1);
      }
    },
  };
};

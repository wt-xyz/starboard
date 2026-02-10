import type { BoundSubscription, SubscriptionTransport } from './types';

export interface SubscriptionService {
  subscribe<TEntity>(
    subscription: BoundSubscription<TEntity>,
    handler: (entity: TEntity) => void
  ): void;
  unsubscribe<TEntity>(
    subscription: BoundSubscription<TEntity>,
    handler: (entity: TEntity) => void
  ): void;
}

export const createSubscriptionService = (
  transport: SubscriptionTransport
): SubscriptionService => {
  const active = new Map<string, ActiveSubscription>();

  return {
    subscribe(subscription, handler) {
      const existing = active.get(subscription.topic);

      if (existing) {
        existing.handlers.add(handler);
        return;
      }

      const handlers = new Set<Handler>([handler]);
      const cleanup = transport.subscribe(subscription.topic, (raw) => {
        const entity = subscription.parse(raw);
        handlers.forEach((callHandler) => callHandler(entity));
      });
      active.set(subscription.topic, { cleanup, handlers });
    },

    unsubscribe(subscription, handler) {
      const entry = active.get(subscription.topic);
      if (!entry) return;

      entry.handlers.delete(handler);

      if (entry.handlers.size === 0) {
        entry.cleanup();
        active.delete(subscription.topic);
      }
    },
  };
};

interface ActiveSubscription {
  cleanup: () => void;
  handlers: Set<Handler>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (entity: any) => void;

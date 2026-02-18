import type { BoundSubscription, SubscriptionFactory } from './types';

interface SubscriptionConfig<TArgs, TEntity> {
  topic(args: TArgs): string;
  parse(data: unknown): TEntity;
}

export const defineSubscription = <TArgs, TEntity>(
  config: SubscriptionConfig<TArgs, TEntity>
): SubscriptionFactory<TArgs, TEntity> => {
  return (args: TArgs): BoundSubscription<TEntity> => ({
    topic: config.topic(args),
    parse: config.parse,
  });
};

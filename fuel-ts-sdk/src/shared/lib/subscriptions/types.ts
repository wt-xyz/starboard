/**
 * Transport abstraction for subscription connections.
 * Decouples the subscription service from the underlying protocol
 * (graphql-ws, plain WebSocket, SSE, etc.)
 */
export interface SubscriptionTransport {
  subscribe(topic: string, handler: (data: unknown) => void): () => void;
}

/**
 * Factory that binds arguments to produce a BoundSubscription.
 * Created via defineSubscription(). When TArgs is void, callable without arguments.
 */
export type SubscriptionFactory<TArgs, TEntity> = (args: TArgs) => BoundSubscription<TEntity>;

/**
 * A subscription bound to specific arguments, ready to be observed.
 * Produced by calling a SubscriptionFactory with args.
 */
export interface BoundSubscription<TEntity> {
  topic: string;
  parse(data: unknown): TEntity;
}

import type { Client } from 'graphql-ws';
import type { SubscriptionTransport } from './types';

export const createGraphqlWsTransport = (wsClient: Client): SubscriptionTransport => ({
  subscribe(topic, handler) {
    return wsClient.subscribe(
      { query: topic },
      {
        next: ({ data }) => {
          if (data) handler(data);
        },
        error: (err) => {
          // eslint-disable-next-line no-console
          console.error('[SubscriptionTransport]', err);
        },
        complete: () => {},
      }
    );
  },
});

import { createTradingModule } from '@/trading';
import { GraphQLClient } from 'graphql-request';

import { createStore } from './shared/lib/redux';
import { createStoreService } from './shared/lib/store-service';

export type StarboardClient = ReturnType<typeof createStarboardClient>;

export interface StarboardClientConfig {
  indexerUrl: string;
}

export const createStarboardClient = (config: StarboardClientConfig) => {
  const graphqlClient = new GraphQLClient(config.indexerUrl);

  const tradingModule = createTradingModule(graphqlClient);

  const starboardStore = createStore(tradingModule.getThunkExtras());
  const storeService = createStoreService(starboardStore);

  return {
    trading: tradingModule.createServices(storeService),
    starboardStore,
  };
};

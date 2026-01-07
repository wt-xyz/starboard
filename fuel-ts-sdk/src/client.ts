import { GraphQLClient } from 'graphql-request';
import { createAccountModule } from '@/account/di';
import { createTradingModule } from '@/trading/di';
import type { RootState } from './shared/lib/redux';
import { createStore } from './shared/lib/redux';
import { createStoreService } from './shared/lib/store-service';

export type { RootState };
export type StarboardClient = ReturnType<typeof createStarboardClient>;

export interface StarboardClientConfig {
  indexerUrl: string;
}

export const createStarboardClient = (config: StarboardClientConfig) => {
  const graphqlClient = new GraphQLClient(config.indexerUrl);

  const tradingModule = createTradingModule(graphqlClient);
  const accountModule = createAccountModule();

  // Get thunk extras from each module
  const tradingThunkExtras = tradingModule.getThunkExtras();
  const accountThunkExtras = accountModule.getThunkExtras();

  const starboardStore = createStore(tradingThunkExtras);
  const storeService = createStoreService(starboardStore);

  return {
    trading: tradingModule.createCommandsAndQueries(storeService),
    account: accountModule.createCommandsAndQueries(storeService, accountThunkExtras),
    store: starboardStore,
  };
};

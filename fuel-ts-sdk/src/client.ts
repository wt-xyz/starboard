import { GraphQLClient } from 'graphql-request';
import { createPortfolioModule } from '@/cross-domain/portfolio';
import { createTradingModule } from '@/trading/di';
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

  const portfolioModule = createPortfolioModule({
    getState: starboardStore.getState,
    trading: tradingModule,
  });

  return {
    trading: tradingModule.createCommands(storeService),
    portfolio: portfolioModule.queries,
    store: starboardStore,
  };
};

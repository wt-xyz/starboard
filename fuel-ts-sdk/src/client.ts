import { GraphQLClient } from 'graphql-request';
import { createTradingModule } from '@/trading/di';
import { createWalletModule } from '@/wallet';
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
  const walletModule = createWalletModule();

  const starboardStore = createStore(tradingModule.getThunkExtras());
  const storeService = createStoreService(starboardStore);

  return {
    trading: tradingModule.createCommandsAndQueries(storeService),
    wallet: walletModule.createCommandsAndQueries(storeService),
    store: starboardStore,
  };
};

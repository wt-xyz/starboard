import { GraphQLClient } from 'graphql-request';
import { createTradingModule } from '@/trading/di';
import type { RootState } from './shared/lib/redux';
import { createStore } from './shared/lib/redux';
import { createStoreService } from './shared/lib/store-service';
import {
  createWalletQueries,
  setWalletConnected,
  setWalletDisconnected,
} from '@/wallet';

export type { RootState };
export type StarboardClient = ReturnType<typeof createStarboardClient>;

export interface StarboardClientConfig {
  indexerUrl: string;
}

export const createStarboardClient = (config: StarboardClientConfig) => {
  const graphqlClient = new GraphQLClient(config.indexerUrl);

  const tradingModule = createTradingModule(graphqlClient);

  const starboardStore = createStore(tradingModule.getThunkExtras());
  const storeService = createStoreService(starboardStore);

  const walletQueries = createWalletQueries(storeService);

  return {
    trading: tradingModule.createCommandsAndQueries(storeService),
    wallet: {
      ...walletQueries,
      setConnected: (address: string) =>
        starboardStore.dispatch(setWalletConnected({ address })),
      setDisconnected: () => starboardStore.dispatch(setWalletDisconnected()),
    },
    store: starboardStore,
  };
};

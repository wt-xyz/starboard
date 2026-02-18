import { combineReducers } from '@reduxjs/toolkit';
import type { WalletQueries } from '@sdk/Accounts';
import type { VaultCommands } from '@sdk/shared/contracts';
import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import type { GraphQLClient } from 'graphql-request';
import * as Markets from './src/Markets';
import * as Positions from './src/Positions';
import * as ApplicationServices from './src/application';

export interface TradingModuleConfig {
  graphqlClient: GraphQLClient;
}

export interface TradingCommandsAndQueriesDependencies {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
  vaultCommands: VaultCommands;
  walletQueries: WalletQueries;
}

export const createTradingModule = ({ graphqlClient }: TradingModuleConfig) => {
  return {
    getThunkExtras: (): TradingThunkExtras => ({
      assetPriceRepository:
        Markets.marketsAdapters.createGraphQLAssetPriceRepository(graphqlClient),
      candleRepository: Markets.marketsAdapters.createGraphQLCandleRepository(graphqlClient),
      fundingInfoRepository: Markets.marketsAdapters.createGraphqlFundingInfoRepository({
        graphqlClient,
      }),
      marketStatsRepository: Markets.marketsAdapters.createGraphqlMarketStatsRepository({
        graphqlClient,
      }),
      positionRepository:
        Positions.positionsAdapters.createGraphQLPositionRepository(graphqlClient),
    }),
    createCommandsAndQueries: (deps: TradingCommandsAndQueriesDependencies) => {
      const { storeService, subscriptionService, vaultCommands, walletQueries } = deps;

      const positionCommands = Positions.createPositionCommands({
        vaultCommands,
        storeService,
        subscriptionService,
      });
      const positionsQueries = Positions.createPositionQueries({ storeService });
      const marketCommands = Markets.createMarketCommands({ storeService, subscriptionService });
      const marketQueries = Markets.createMarketQueries(storeService);
      const tradingCommands = ApplicationServices.createTradingCommands({
        vaultCommands,
        positionsQueries,
        marketQueries,
      });
      const tradingQueries = ApplicationServices.createTradingQueries({
        marketQueries,
        positionsQueries,
        walletQueries,
      });
      const tradingWorkflows = ApplicationServices.createTradingWorkflows({
        marketCommands,
        marketQueries,
        positionsQueries,
        walletQueries,
      });

      return {
        ...positionCommands,
        ...marketCommands,
        ...positionsQueries,
        ...marketQueries,
        ...tradingCommands,
        ...tradingQueries,
        vault: vaultCommands,
        workflows: tradingWorkflows,
      };
    },
  };
};

export const tradingReducer = combineReducers({
  markets: Markets.marketsReducer,
  positions: Positions.positionsReducer,
});

export const tradingApis = {
  ...Markets.marketsApis,
  ...Positions.positionsApis,
};

export const tradingMiddleware = [...Markets.marketsMiddleware, ...Positions.positionsMiddleware];

export type TradingModule = ReturnType<typeof createTradingModule>;
export type TradingThunkExtras = Markets.MarketsThunkExtra & Positions.PositionsThunkExtra;

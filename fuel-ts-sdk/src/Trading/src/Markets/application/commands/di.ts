import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import type { StoreService } from '@sdk/shared/lib/StoreService';
import { createFetchCandlesCommand } from './fetchCandles';
import { createFetchLatestAssetPriceCommand } from './fetchLatestAssetPrice';
import { createFetchMarketStatsCommand } from './fetchMarketStats';
import { createPopulateAssetsCommand } from './populateAssets';
import { createSubscribeToAssetPriceCommands } from './subscribeToAssetPriceUpdates';
import { createWatchAssetCommand } from './watchAsset';

interface MarketCommandsDependencies {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
}

export const createMarketCommands = (deps: MarketCommandsDependencies) => ({
  fetchCandles: createFetchCandlesCommand(deps.storeService),
  fetchLatestAssetPrice: createFetchLatestAssetPriceCommand(deps.storeService),

  populateAssets: createPopulateAssetsCommand(deps.storeService),
  watchAsset: createWatchAssetCommand(deps.storeService),

  fetchMarketStats: createFetchMarketStatsCommand({ storeService: deps.storeService }),

  ...createSubscribeToAssetPriceCommands(deps),
});

export type MarketCommands = ReturnType<typeof createMarketCommands>;

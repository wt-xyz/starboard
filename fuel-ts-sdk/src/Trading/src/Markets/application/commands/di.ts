import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { SubscriptionService } from '@sdk/shared/lib/subscriptions';
import { createFetchCandlesCommand } from './fetchCandles';
import { createFetchLatestAssetPriceCommand } from './fetchLatestAssetPrice';
import { createFetchMarketStatsCommand } from './fetchMarketStats';
import { createPopulateAssetsCommand } from './populateAssets';
import { createSyncAssetPriceCommands } from './subscribeToAssetPriceUpdates';
import { createSyncFundingInfoCommands } from './subscribeToFundingInfoUpdates';
import { createWatchAssetCommand } from './watchAsset';

type MarketCommandsDependencies = {
  storeService: StoreService;
  subscriptionService: SubscriptionService;
};

export const createMarketCommands = (deps: MarketCommandsDependencies) => ({
  fetchCandles: createFetchCandlesCommand(deps.storeService),
  fetchLatestAssetPrice: createFetchLatestAssetPriceCommand(deps.storeService),

  populateAssets: createPopulateAssetsCommand(deps.storeService),
  watchAsset: createWatchAssetCommand(deps.storeService),

  fetchMarketStats: createFetchMarketStatsCommand({ storeService: deps.storeService }),

  ...createSyncAssetPriceCommands(deps),
  ...createSyncFundingInfoCommands(deps),
});

export type MarketCommands = ReturnType<typeof createMarketCommands>;

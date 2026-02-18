import type { StoreService } from '@sdk/shared/lib/StoreService';
import { createGetAllAssetsQuery } from './getAllAssets';
import { createGetAllAssetsLatestPricesQuery } from './getAllAssetsLatestPrices';
import { createGetAssetByIdQuery } from './getAssetById';
import { createGetAssetLatestPriceQuery } from './getAssetLatestPrice';
import { createGetWatchedAssetMarketStatsQuery } from './getAssetMarketStats';
import { createGetAssetPriceChange24hQuery } from './getAssetPriceChange24h';
import { createGetBaseAssetQuery } from './getBaseAsset';
import { createGetBaseAssetLatestPriceQuery } from './getBaseAssetLatestPrice';
import { createGetCandles } from './getCandles';
import { createGetCandlesStatus } from './getCandlesStatus';
import { createGetWatchedAssetQuery } from './getWatchedAsset';
import { createGetWatchedAssetFundingInfoQuery } from './getWatchedAssetFundingInfo';
import { createGetWatchedAssetLatestPriceQuery } from './getWatchedAssetLatestPrice';

export const createMarketQueries = (storeService: StoreService) => ({
  getCandles: createGetCandles(storeService),
  getCandlesStatus: createGetCandlesStatus(storeService),
  getAllAssets: createGetAllAssetsQuery(storeService),
  getAllAssetsLatestPrices: createGetAllAssetsLatestPricesQuery(storeService),
  getWatchedAsset: createGetWatchedAssetQuery(storeService),
  getBaseAsset: createGetBaseAssetQuery(storeService),
  getAssetById: createGetAssetByIdQuery(storeService),
  getWatchedAssetLatestPrice: createGetWatchedAssetLatestPriceQuery(storeService),
  getBaseAssetLatestPrice: createGetBaseAssetLatestPriceQuery(storeService),
  getAssetLatestPrice: createGetAssetLatestPriceQuery(storeService),
  getAssetPriceChange24h: createGetAssetPriceChange24hQuery({ storeService }),
  getWatchedAssetMarketStats: createGetWatchedAssetMarketStatsQuery({ storeService }),
  getWatchedAssetFundingInfo: createGetWatchedAssetFundingInfoQuery({ storeService }),
});

export type MarketQueries = ReturnType<typeof createMarketQueries>;

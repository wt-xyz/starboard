import { combineReducers } from '@reduxjs/toolkit';
import type { AssetPricesThunkExtra } from './AssetPrices';
import { assetPricesReducer } from './AssetPrices';
import { assetsReducer } from './Assets';
import type { CandlesThunkExtra } from './Candles';
import { candlesApi } from './Candles';
import type { FundingInfoThunkExtra } from './FundingInfo';
import { fundingInfoReducer } from './FundingInfo';
import type { MarketStatsThunkExtra } from './MarketStats';
import { marketStatsReducer } from './MarketStats';

export const marketsReducer = combineReducers({
  assetPrices: assetPricesReducer,
  assets: assetsReducer,
  fundingInfo: fundingInfoReducer,
  marketStats: marketStatsReducer,
});

export const marketsApis = {
  candlesApi: candlesApi.reducer,
};

export const marketsMiddleware = [candlesApi.middleware];

export type MarketsThunkExtra = AssetPricesThunkExtra &
  CandlesThunkExtra &
  FundingInfoThunkExtra &
  MarketStatsThunkExtra;

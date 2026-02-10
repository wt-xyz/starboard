import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AssetId } from '@sdk/shared/types';
import type { MarketStatsEntity, MarketStatsRepository } from '../../../domain';

export interface MarketStatsThunkExtra {
  marketStatsRepository: MarketStatsRepository;
}

export const asyncFetchMarketStatsByAssetIdThunk = createAsyncThunk<
  MarketStatsEntity | undefined,
  AssetId,
  { rejectValue: string; extra: MarketStatsThunkExtra }
>('markets/marketStats/fetchByAssetId', async (assetId, { rejectWithValue, extra }) => {
  try {
    return await extra.marketStatsRepository.getMarketStatsByAssetId(assetId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

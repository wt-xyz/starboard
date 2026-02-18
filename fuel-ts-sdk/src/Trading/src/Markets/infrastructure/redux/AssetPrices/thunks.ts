import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AssetId } from '@sdk/shared/types';
import type { AssetPriceEntity, AssetPriceRepository } from '../../../domain';

export interface AssetPricesThunkExtra {
  assetPriceRepository: AssetPriceRepository;
}

export const asyncFetchCurrentAssetPricesThunk = createAsyncThunk<
  AssetPriceEntity | undefined,
  AssetId,
  { rejectValue: string; extra: AssetPricesThunkExtra }
>('markets/assetPrices/fetchCurrent', async (assetId, { rejectWithValue, extra }) => {
  try {
    return await extra.assetPriceRepository.getCurrentAssetPrice(assetId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

const SECONDS_IN_24H = 86400;

export const asyncFetchAssetPrice24hAgoThunk = createAsyncThunk<
  AssetPriceEntity | undefined,
  AssetId,
  { rejectValue: string; extra: AssetPricesThunkExtra }
>('markets/assetPrices/fetch24hAgo', async (assetId, { rejectWithValue, extra }) => {
  try {
    const results = await extra.assetPriceRepository.getHistoricalAssetPrices({
      asset: assetId,
      timestampLte: Math.floor(Date.now() / 1000) - SECONDS_IN_24H,
      limit: 1,
      orderBy: 'TIMESTAMP_DESC',
    });
    return results.at(0);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

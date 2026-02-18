import { createSlice } from '@reduxjs/toolkit';
import { AssetPriceUpdatedEvent } from '../../../domain';
import { asyncFetchAssetPrice24hAgoThunk, asyncFetchCurrentAssetPricesThunk } from './thunks';
import { assetPricesAdapter, assetPricesInitialState } from './types';

export const assetPricesSlice = createSlice({
  name: 'assetPrices',
  initialState: assetPricesInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(asyncFetchCurrentAssetPricesThunk.pending, (state) => {
        state.fetchStatus = 'pending';
        state.error = null;
      })
      .addCase(asyncFetchCurrentAssetPricesThunk.fulfilled, (state, action) => {
        if (action.payload) assetPricesAdapter.upsertOne(state, action.payload);
        state.fetchStatus = 'fulfilled';
      })
      .addCase(asyncFetchCurrentAssetPricesThunk.rejected, (state, action) => {
        state.fetchStatus = 'rejected';
        state.error = action.payload ?? 'Failed to fetch current asset prices';
      })
      .addCase(asyncFetchAssetPrice24hAgoThunk.fulfilled, (state, action) => {
        if (action.payload) assetPricesAdapter.upsertOne(state, action.payload);
      })
      .addMatcher(AssetPriceUpdatedEvent.match, (state, action) => {
        assetPricesAdapter.upsertOne(state, action.payload);
      });
  },
});

export const { reducer: assetPricesReducer } = assetPricesSlice;

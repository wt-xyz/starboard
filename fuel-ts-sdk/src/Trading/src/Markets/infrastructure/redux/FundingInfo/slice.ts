import { createSlice } from '@reduxjs/toolkit';
import { AssetFundingInfoUpdatedEvent } from '../../../domain';
import { asyncFetchCurrentFundingInfoThunk } from './thunks';
import { fundingInfoAdapter, nullFundingInfoState } from './types';

export const fundingInfoSlice = createSlice({
  name: 'markets/fundingInfo',
  initialState: nullFundingInfoState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(asyncFetchCurrentFundingInfoThunk.pending, (state) => {
        state.fetchStatus = 'pending';
        state.error = null;
      })
      .addCase(asyncFetchCurrentFundingInfoThunk.fulfilled, (state, action) => {
        if (action.payload) fundingInfoAdapter.upsertOne(state, action.payload);
        state.fetchStatus = 'fulfilled';
      })
      .addCase(asyncFetchCurrentFundingInfoThunk.rejected, (state, action) => {
        state.fetchStatus = 'rejected';
        state.error = action.payload ?? 'Failed to fetch funding info';
      })
      .addMatcher(AssetFundingInfoUpdatedEvent.match, (state, action) => {
        fundingInfoAdapter.upsertOne(state, action.payload);
      });
  },
});

export const { reducer: fundingInfoReducer } = fundingInfoSlice;

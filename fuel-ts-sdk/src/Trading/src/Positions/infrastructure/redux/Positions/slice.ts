import { createSlice } from '@reduxjs/toolkit';
import { positionsApi } from './api';
import { nullPositionsState, positionsAdapter } from './types';

export const positionsSlice = createSlice({
  name: 'positions',
  initialState: nullPositionsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(positionsApi.endpoints.getPositionsByAddress.matchPending, (state) => {
        state.fetchStatus = 'pending';
        state.error = null;
      })
      .addMatcher(positionsApi.endpoints.getPositionsByAddress.matchFulfilled, (state, action) => {
        if (action.payload) positionsAdapter.setAll(state, action.payload);
        state.fetchStatus = 'fulfilled';
      })
      .addMatcher(positionsApi.endpoints.getPositionsByAddress.matchRejected, (state, action) => {
        state.fetchStatus = 'rejected';
        state.error = action.error?.message ?? 'Failed to fetch positions';
      });
  },
});

export const positionsSliceReducer = positionsSlice.reducer;

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { Address, PositionRevisionId } from '@sdk/shared/types';
import type { PositionEntity } from '../../../domain';
import { positionsApi } from './api';

export const positionsAdapter = createEntityAdapter<PositionEntity, PositionRevisionId>({
  selectId: (position) => position.revisionId,
  sortComparer: (a, b) => b.timestamp - a.timestamp,
});

export const positionsSlice = createSlice({
  name: 'positions',
  initialState: positionsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      positionsApi.endpoints.getPositionsByAddress.matchFulfilled,
      (state, action) => {
        if (!action.payload) return;
        const address = action.meta.arg as unknown as Address | undefined;
        // Replace all positions for this account with the fresh response so we show full history
        if (address) {
          const idsToRemove = (state.ids as PositionRevisionId[]).filter((id) => {
            const entity = state.entities[id];
            return entity?.accountAddress === address;
          });
          positionsAdapter.removeMany(state, idsToRemove);
        }
        positionsAdapter.upsertMany(state, action.payload);
      }
    );
  },
});

export const positionsSliceReducer = positionsSlice.reducer;

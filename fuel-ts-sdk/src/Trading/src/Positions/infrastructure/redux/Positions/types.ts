import { createEntityAdapter } from '@reduxjs/toolkit';
import type { LoadableMixin } from '@sdk/shared/lib/redux';
import type { PositionRevisionId } from '@sdk/shared/types';
import type { PositionEntity } from '../../../domain';

export const positionsAdapter = createEntityAdapter<PositionEntity, PositionRevisionId>({
  selectId: (position) => position.revisionId,
  sortComparer: (a, b) => b.timestamp - a.timestamp,
});

export const nullPositionsState = positionsAdapter.getInitialState<LoadableMixin>({
  fetchStatus: 'uninitialized',
  error: null,
});

export type PositionsState = typeof nullPositionsState;

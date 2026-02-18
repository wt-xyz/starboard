import { createAction } from '@reduxjs/toolkit';
import type { CurrentPositionUpdatedPayload } from '../../infrastructure';

export type PositionChangedEventPayload = CurrentPositionUpdatedPayload;

export const PositionChangedEvent = createAction<PositionChangedEventPayload>(
  'trading/positions/PositionChanged'
);

import { createAction } from '@reduxjs/toolkit';
import type { AssetPriceEntity } from '../AssetPriceEntity';

export type AssetPriceUpdatedEventPayload = AssetPriceEntity;

export const AssetPriceUpdatedEvent = createAction<AssetPriceUpdatedEventPayload>(
  'trading/markets/AssetPriceUpdated'
);

import { createAction } from '@reduxjs/toolkit';
import type { FundingInfoEntity } from '../FundingInfoEntity';

export type AssetFundingInfoUpdatedEventPayload = FundingInfoEntity;

export const AssetFundingInfoUpdatedEvent = createAction<AssetFundingInfoUpdatedEventPayload>(
  'trading/markets/AssetFundingInfoUpdated'
);

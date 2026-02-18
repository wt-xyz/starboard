import { createEntityAdapter } from '@reduxjs/toolkit';
import type { LoadableMixin } from '@sdk/shared/lib/redux';
import type { AssetId } from '@sdk/shared/types';
import type { FundingInfoEntity } from '../../../domain';

export const fundingInfoAdapter = createEntityAdapter<FundingInfoEntity, AssetId>({
  selectId: (fundingInfo) => fundingInfo.assetId,
});

export const nullFundingInfoState = fundingInfoAdapter.getInitialState<LoadableMixin>({
  fetchStatus: 'uninitialized',
  error: null,
});

export type FundingInfoState = typeof nullFundingInfoState;

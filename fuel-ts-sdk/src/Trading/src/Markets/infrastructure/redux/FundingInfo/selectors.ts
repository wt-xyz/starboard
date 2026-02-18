import type { RootState } from '@sdk/shared/lib/redux';
import type { AssetId } from '@sdk/shared/types';
import { fundingInfoAdapter } from './types';

const selectFundingInfoState = (state: RootState) => state.trading.markets.fundingInfo;

const selectors = fundingInfoAdapter.getSelectors(selectFundingInfoState);

export const selectAllFundingInfo = selectors.selectAll;

export const selectFundingInfoByAssetId = (state: RootState, assetId: AssetId) =>
  selectors.selectById(state, assetId);

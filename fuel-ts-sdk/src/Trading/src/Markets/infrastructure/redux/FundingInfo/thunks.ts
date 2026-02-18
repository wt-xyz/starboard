import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AssetId } from '@sdk/shared/types';
import type { FundingInfoEntity, FundingInfoRepository } from '../../../domain';

export interface FundingInfoThunkExtra {
  fundingInfoRepository: FundingInfoRepository;
}

export const asyncFetchCurrentFundingInfoThunk = createAsyncThunk<
  FundingInfoEntity | undefined,
  AssetId,
  { rejectValue: string; extra: FundingInfoThunkExtra }
>('markets/fundingInfo/fetchCurrent', async (assetId, { rejectWithValue, extra }) => {
  try {
    return await extra.fundingInfoRepository.getCurrentFundingInfo(assetId);
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

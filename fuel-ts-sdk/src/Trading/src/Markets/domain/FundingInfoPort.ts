import type { AssetId } from '@sdk/shared/types';
import type { FundingInfoEntity } from './FundingInfoEntity';

export interface FundingInfoRepository {
  getCurrentFundingInfo(assetId: AssetId): Promise<FundingInfoEntity | undefined>;
}

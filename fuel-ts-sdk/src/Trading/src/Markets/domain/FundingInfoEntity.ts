import type { InferDecimalValueType } from '@sdk/shared/models/DecimalValue';
import { createDecimalValueSchema } from '@sdk/shared/models/DecimalValue';
import type { AssetId } from '@sdk/shared/types';
import type { OpenInterest } from './MarketStats';

export const FundingRate = createDecimalValueSchema(18, 'FundingRate');
export type FundingRate = InferDecimalValueType<typeof FundingRate>;

export interface FundingInfoEntity {
  assetId: AssetId;
  totalShortSizes: OpenInterest;
  totalLongSizes: OpenInterest;
  longCumulativeFundingRate: FundingRate;
  shortCumulativeFundingRate: FundingRate;
}

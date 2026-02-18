import { zodDecimalValueSchema } from '@sdk/shared/lib/zod';
import { AssetIdSchema } from '@sdk/shared/types';
import { z } from 'zod';
import type { FundingInfoEntity } from './FundingInfoEntity';
import { FundingRate } from './FundingInfoEntity';
import { OpenInterest } from './MarketStats';

export const FundingInfoEntitySchema = z.object({
  assetId: AssetIdSchema,
  totalShortSizes: zodDecimalValueSchema(OpenInterest),
  totalLongSizes: zodDecimalValueSchema(OpenInterest),
  longCumulativeFundingRate: zodDecimalValueSchema(FundingRate),
  shortCumulativeFundingRate: zodDecimalValueSchema(FundingRate),
}) satisfies z.ZodType<FundingInfoEntity, z.ZodTypeDef, unknown>;

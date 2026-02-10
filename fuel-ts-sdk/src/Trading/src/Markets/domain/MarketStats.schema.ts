import { zodDecimalValueSchema } from '@sdk/shared/lib/zod';
import { AssetIdSchema } from '@sdk/shared/types';
import { z } from 'zod';
import type { MarketStatsEntity } from './MarketStats';
import { OpenInterest, TradeVolume } from './MarketStats';

export const MarketStatsEntitySchema = z.object({
  assetId: AssetIdSchema,
  openInterestLong: zodDecimalValueSchema(OpenInterest),
  openInterestShort: zodDecimalValueSchema(OpenInterest),
  volume24h: zodDecimalValueSchema(TradeVolume),
}) satisfies z.ZodType<MarketStatsEntity, z.ZodTypeDef, unknown>;

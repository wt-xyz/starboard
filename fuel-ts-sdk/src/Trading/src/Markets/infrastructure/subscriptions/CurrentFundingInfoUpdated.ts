import { defineSubscription } from '@sdk/shared/lib/subscriptions';
import type { AssetId } from '@sdk/shared/types';
import type { z } from 'zod';
import { FundingInfoEntitySchema } from '../../domain';

export type CurrentFundingInfoUpdatedPayload = z.infer<
  typeof CurrentFundingInfoUpdatedPayloadSchema
>;

export const CurrentFundingInfoUpdated = defineSubscription<
  AssetId,
  CurrentFundingInfoUpdatedPayload
>({
  topic: (assetId) =>
    `subscription { currentFundingInfoUpdated(asset: "${assetId}") { asset totalShortSizes totalLongSizes longCumulativeFundingRate shortCumulativeFundingRate } }`,

  parse: (data) => {
    if (typeof data !== 'object' || data === null || !('currentFundingInfoUpdated' in data)) {
      throw new Error('[CurrentFundingInfoUpdated] Missing currentFundingInfoUpdated in payload');
    }

    const payload = data.currentFundingInfoUpdated as Record<string, unknown>;
    return CurrentFundingInfoUpdatedPayloadSchema.parse({
      assetId: payload['asset'],
      totalShortSizes: payload['totalShortSizes'],
      totalLongSizes: payload['totalLongSizes'],
      longCumulativeFundingRate: payload['longCumulativeFundingRate'],
      shortCumulativeFundingRate: payload['shortCumulativeFundingRate'],
    });
  },
});

const CurrentFundingInfoUpdatedPayloadSchema = FundingInfoEntitySchema;

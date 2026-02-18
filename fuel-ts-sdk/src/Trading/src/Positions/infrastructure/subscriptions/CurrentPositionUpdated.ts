import { defineSubscription } from '@sdk/shared/lib/subscriptions';
import type { Address } from '@sdk/shared/types';
import { AddressSchema, AssetIdSchema, PositionStableIdSchema } from '@sdk/shared/types';
import { z } from 'zod';
import { PositionChange } from '../../domain';

export type CurrentPositionUpdatedPayload = z.infer<typeof CurrentPositionUpdatedPayloadSchema>;

export const CurrentPositionUpdated = defineSubscription<Address, CurrentPositionUpdatedPayload>({
  topic: (account) =>
    `subscription { currentPositionUpdated(account: "${account}") { account asset isLong openId positionKeyId change } }`,

  parse: (data) => {
    if (typeof data !== 'object' || data === null || !('currentPositionUpdated' in data)) {
      throw new Error('[CurrentPositionUpdated] Missing currentPositionUpdated in payload');
    }

    const payload = data.currentPositionUpdated as Record<string, unknown>;
    return CurrentPositionUpdatedPayloadSchema.parse(payload);
  },
});

const CurrentPositionUpdatedPayloadSchema = z.object({
  account: AddressSchema,
  asset: AssetIdSchema,
  isLong: z.boolean(),
  openId: z.string(),
  positionKeyId: PositionStableIdSchema,
  change: z.nativeEnum(PositionChange),
});

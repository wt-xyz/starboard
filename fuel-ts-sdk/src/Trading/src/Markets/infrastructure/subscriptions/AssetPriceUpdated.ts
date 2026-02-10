import { defineSubscription } from '@sdk/shared/lib/subscriptions';
import type { AssetId } from '@sdk/shared/types';
import type { AssetPriceEntity } from '../../domain';
import { AssetPriceEntitySchema } from '../../domain';

export const AssetPriceUpdated = defineSubscription<AssetId, AssetPriceEntity>({
  topic: (assetId) =>
    `subscription { currentPriceUpdated(asset: "${assetId}") { asset timestamp price } }`,

  parse: (data) => {
    if (typeof data !== 'object' || data === null || !('currentPriceUpdated' in data)) {
      throw new Error('[AssetPriceUpdated] Missing currentPriceUpdated in payload');
    }

    const payload = data.currentPriceUpdated as Record<string, unknown>;
    return AssetPriceEntitySchema.parse({
      id: `${payload['asset']}-${payload['timestamp']}`,
      assetId: payload['asset'],
      value: payload['price'],
      timestamp: payload['timestamp'],
    });
  },
});

import type { FC } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { propify } from '@/lib/propify';
import { MarketStat } from './_MarketStatsBase';

export const OpenInterestStat: FC = () => {
  const sdk = useTradingSdk();
  const watchedAsset = useSdkQuery(sdk.getWatchedAsset);
  const assetId = watchedAsset?.assetId;
  const total = useSdkQuery(() => (assetId ? sdk.getAssetOpenInterestTotal(assetId) : null));
  const longPct = useSdkQuery(() => (assetId ? sdk.getAssetOpenInterestLongPct(assetId) : null));
  const shortPct = useSdkQuery(() => (assetId ? sdk.getAssetOpenInterestShortPct(assetId) : null));

  if (total === null) return <_OpenInterestStat value="$--" />;
  if (total === 0) return <_OpenInterestStat value="$0" />;

  const longDisplay = longPct !== null ? Math.round(longPct * 100) : null;
  const shortDisplay = shortPct !== null ? Math.round(shortPct * 100) : null;
  const totalFormatted = formatCurrency(total, { compact: true, symbol: '$' });

  if (longDisplay !== null && shortDisplay !== null) {
    return <_OpenInterestStat value={`${totalFormatted} (${longDisplay}L/${shortDisplay}S)`} />;
  }

  return <_OpenInterestStat value={totalFormatted} />;
};

const _OpenInterestStat = propify(MarketStat, { label: 'Open Interest' });

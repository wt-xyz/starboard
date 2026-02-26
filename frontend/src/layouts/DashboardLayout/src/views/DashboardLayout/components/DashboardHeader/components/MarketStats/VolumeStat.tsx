import type { FC } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { propify } from '@/lib/propify';
import { MarketStat } from './_MarketStatsBase';

export const VolumeStat: FC = () => {
  const sdk = useTradingSdk();
  const watchedAsset = useSdkQuery(sdk.getWatchedAsset);
  const volume = useSdkQuery(() =>
    watchedAsset ? sdk.getAssetVolume24h(watchedAsset.assetId) : null
  );

  if (volume == null) return <_VolumeStat value="$--" />;

  return <_VolumeStat value={formatCurrency(volume, { compact: true, symbol: '$' })} />;
};

const _VolumeStat = propify(MarketStat, { label: '24H Volume' });

import { type FC, memo, useCallback, useEffect } from 'react';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
import * as $ from './DashboardHeader.css';
import { AssetCurrentPrice } from './components/AssetCurrentPrice';
import { AssetSelect } from './components/AssetSelect';
import { FundingRateStat, OpenInterestStat, VolumeStat } from './components/MarketStats';

export const DashboardHeader: FC = () => (
  <div css={$.container}>
    <div css={$.assetSection}>
      <AssetSelect />
      <AssetCurrentPrice />
    </div>

    <div css={$.separator} />

    <div css={$.statsSection}>
      <OpenInterestStat />
      <VolumeStat />
      <FundingRateStat />
    </div>

    <MarketStatsPolling />
    <FundingInfoSync />
  </div>
);

const MarketStatsPolling = memo(() => {
  const tradingSdk = useTradingSdk();
  const watchedAsset = useSdkQuery(tradingSdk.getWatchedAsset);

  usePolling(
    useCallback(() => {
      if (!watchedAsset) return;
      tradingSdk.fetchMarketStats(watchedAsset?.assetId);
    }, [tradingSdk, watchedAsset]),
    5_000
  );

  return null;
});
MarketStatsPolling.displayName = 'MarketStatsPolling';

const FundingInfoSync = memo(() => {
  const trading = useTradingSdk();
  const watchedAsset = useSdkQuery(trading.getWatchedAsset);
  const assetId = watchedAsset?.assetId;

  useEffect(() => {
    if (!assetId) return;
    trading.syncFundingInfo(assetId);
    return () => trading.desyncFundingInfo(assetId);
  }, [trading, assetId]);

  return null;
});
FundingInfoSync.displayName = 'FundingInfoSync';

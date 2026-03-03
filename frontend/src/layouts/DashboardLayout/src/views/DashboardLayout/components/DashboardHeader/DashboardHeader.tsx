import { type FC, memo, useCallback, useEffect } from 'react';
import logoStarboard from '@/assets/logo-starboard.png';
import { AssetSelect } from '@/components/AssetSelect';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { componentize } from '@/lib/componentize';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
import * as $ from './DashboardHeader.css';
import { AssetCurrentPrice } from './components/AssetCurrentPrice';
import { HamburgerMenu } from './components/HamburgerMenu';
import { FundingRateStat, OpenInterestStat, VolumeStat } from './components/MarketStats';
import { NetworkSwitcher } from './components/NetworkSwitcher';

export const DashboardHeader: FC = () => (
  <>
    <$$.header>
      <$$.headerLeft>
        <img src={logoStarboard} alt="Starboard" css={$.logo} />

        <div css={$.desktopOnly}>
          <AssetSelect />
        </div>
      </$$.headerLeft>

      <$$.statsSection css={$.desktopOnly}>
        <AssetCurrentPrice />
        <OpenInterestStat />
        <VolumeStat />
        <FundingRateStat />
      </$$.statsSection>

      <$$.headerRight css={$.desktopOnly}>
        <NetworkSwitcher />
        <ConnectWalletButton />
      </$$.headerRight>

      <$$.headerRight css={$.mobileOnly}>
        <HamburgerMenu />
      </$$.headerRight>
    </$$.header>

    <MarketStatsPolling />
    <FundingInfoSync />
  </>
);

const $$ = componentize($);

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

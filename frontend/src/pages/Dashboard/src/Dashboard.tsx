import { useEffect } from 'react';
import { componentize } from '@/lib/componentize';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useMediaQuery } from '@/lib/useMediaQuery';
import * as $ from './Dashboard.css';
import { BottomMenu } from './components/BottomMenu';
import { DashboardOrderEntryForm } from './components/DashboardOrderEntryForm';
import { DashboardTradingChart } from './components/DashboardTradingChart';
import { ExchangeLists } from './components/ExchangeLists';
import { MobileMarketHeader } from './components/MobileMarketHeader';

export function Dashboard() {
  const isCompactLayout = useMediaQuery('(max-width: 1024px)');

  return (
    <>
      <$$.page>
        {isCompactLayout && (
          <$$.mobileHeader>
            <MobileMarketHeader />
          </$$.mobileHeader>
        )}

        <$$.leftColumn>
          <$$.chartSection>
            <DashboardTradingChart />
          </$$.chartSection>

          <$$.bottomSection>
            <ExchangeLists />
          </$$.bottomSection>
        </$$.leftColumn>

        <$$.orderEntrySection>
          <$$.orderEntryFormWrapper>
            <DashboardOrderEntryForm />
          </$$.orderEntryFormWrapper>
        </$$.orderEntrySection>
      </$$.page>

      {isCompactLayout && <BottomMenu />}

      <BackgroundPriceSubscriptions />
    </>
  );
}

const $$ = componentize($);

const BackgroundPriceSubscriptions = () => {
  const trading = useTradingSdk();

  const watchedAsset = useSdkQuery((sdk) => sdk.trading.getWatchedAsset());
  const openPositions = useSdkQuery((sdk) => sdk.trading.getCurrentAccountOpenPositions());

  useEffect(() => {
    trading.workflows.syncAccountTrackedAssetPrices();
  }, [trading.workflows, watchedAsset, openPositions]);

  useEffect(() => {
    return () => trading.workflows.syncAccountTrackedAssetPrices.dispose();
  }, [trading.workflows]);

  return null;
};

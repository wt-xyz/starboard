import { useEffect } from 'react';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useMediaQuery } from '@/lib/useMediaQuery';
import * as styles from './Dashboard.css';
import { BottomMenu } from './components/BottomMenu';
import { DashboardOrderEntryForm } from './components/DashboardOrderEntryForm';
import { DashboardTradingChart } from './components/DashboardTradingChart';
import { ExchangeLists } from './components/ExchangeLists';
import { MobileMarketHeader } from './components/MobileMarketHeader';

export function Dashboard() {
  const isCompactLayout = useMediaQuery('(max-width: 1024px)');

  return (
    <>
      <div css={styles.page}>
        {isCompactLayout && (
          <div css={styles.mobileHeader}>
            <MobileMarketHeader />
          </div>
        )}

        <div css={styles.chartSection}>
          <DashboardTradingChart />
        </div>

        <div css={styles.orderEntrySection}>
          <h2 css={styles.orderEntryTitle}>Order Entry</h2>

          <div css={styles.orderEntryFormWrapper}>
            <DashboardOrderEntryForm />
          </div>
        </div>

        <div css={styles.bottomSection}>
          <ExchangeLists />
        </div>
      </div>

      {isCompactLayout && <BottomMenu />}

      <BackgroundPriceSubscriptions />
    </>
  );
}

const BackgroundPriceSubscriptions = () => {
  const trading = useTradingSdk();

  const watchedAsset = useSdkQuery((sdk) => sdk.trading.getWatchedAsset());
  const openPositions = useSdkQuery((sdk) => sdk.trading.getCurrentAccountOpenPositions());

  useEffect(() => {
    trading.workflows.syncAccountTrackedAssetPrices();
  }, [trading.workflows, watchedAsset, openPositions]);

  return null;
};

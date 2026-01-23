import { Tabs } from 'radix-ui';
import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
import * as styles from './Dashboard.css';
import { DashboardOrderEntryForm } from './components/DashboardOrderEntryForm';
import { DashboardTradingChart } from './components/DashboardTradingChart';
import { PositionsList } from './components/PositionsList';

type SheetType = 'long' | 'short';

export function Dashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetType>('long');

  const handleMenuClick = (tabType: SheetType) => {
    setActiveTab(tabType);
    setIsSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open);
  };

  const handleTabSwitch = (tabType: SheetType) => {
    setActiveTab(tabType);
  };

  return (
    <>
      <div css={styles.page}>
        <div css={styles.container}>
          <div css={styles.chartSection}>
            <DashboardTradingChart />
          </div>

          <div css={styles.rightSection}>
            <div css={styles.orderEntryContainer}>
              <h2 css={styles.orderEntryTitle}>Order Entry</h2>
              <div css={styles.orderEntryFormWrapper}>
                <DashboardOrderEntryForm />
              </div>
            </div>
            <PositionsList />
          </div>
        </div>
      </div>

      {/* Fixed bottom menu for mobile/tablet */}
      <div css={styles.bottomMenu}>
        <button
          css={styles.menuButton}
          data-active={isSheetOpen && activeTab === 'long'}
          onClick={() => handleMenuClick('long')}
          type="button"
        >
          Long
        </button>
        <div css={styles.menuSeparator} />
        <button
          css={styles.menuButton}
          data-active={isSheetOpen && activeTab === 'short'}
          onClick={() => handleMenuClick('short')}
          type="button"
        >
          Short
        </button>
      </div>

      {/* Sheet with tabs inside */}
      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="bottom" showClose={false}>
          <div css={styles.sheetContentWrapper}>
            <Tabs.Root value={activeTab} onValueChange={(v) => handleTabSwitch(v as SheetType)}>
              {/* Tabs inside the sheet */}
              <div css={styles.sheetTabsWrapper}>
                <Tabs.List css={styles.sheetMenuSelector}>
                  <Tabs.Trigger value="long" css={styles.sheetMenuButton} data-tab="long">
                    Long
                  </Tabs.Trigger>
                  <Tabs.Trigger value="short" css={styles.sheetMenuButton} data-tab="short">
                    Short
                  </Tabs.Trigger>
                </Tabs.List>
              </div>

              {/* Content based on active tab */}
              <div css={styles.sheetBodyWrapper}>
                <Tabs.Content value="long" css={styles.tabContent}>
                  <div css={styles.orderEntryFormWrapper}>
                    <DashboardOrderEntryForm key="long-form" defaultOrderSide="long" hideSideSwitch />
                  </div>
                  <PositionsList key="long-positions" filterBySide="long" />
                </Tabs.Content>
                <Tabs.Content value="short" css={styles.tabContent}>
                  <div css={styles.orderEntryFormWrapper}>
                    <DashboardOrderEntryForm
                      key="short-form"
                      defaultOrderSide="short"
                      hideSideSwitch
                    />
                  </div>
                  <PositionsList key="short-positions" filterBySide="short" />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </SheetContent>
      </Sheet>

      <BackgroundPricesPolling />
    </>
  );
}

const BackgroundPricesPolling = () => {
  const trading = useTradingSdk();

  usePolling(trading.workflows.fetchLatestAccountTrackedAssetPrices);

  return null;
};

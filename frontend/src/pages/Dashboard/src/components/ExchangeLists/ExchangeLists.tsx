import { type FC, useCallback, useState } from 'react';
import { Tabs } from 'radix-ui';
import { toast } from 'react-toastify';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { PositionsList } from '../PositionsList';
import * as $ from './ExchangeLists.css';
import { FundingHistoryList } from '@/@starboard/pages/Dashboard/components/ExchangeLists/components/FundingHistoryList';
import { OpenOrdersList } from '@/@starboard/pages/Dashboard/components/ExchangeLists/components/OpenOrdersList';
import { TradeHistoryList } from './components/TradeHistoryList';

export const ExchangeLists: FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.POSITIONS);
  const trading = useTradingSdk();
  const openPositions = useSdkQuery(() => trading.getCurrentAccountOpenPositions());

  const handleCloseAll = useCallback(async () => {
    if (!window.confirm(`Close all ${openPositions.length} positions at market price?`)) return;

    const results = await Promise.allSettled(
      openPositions.map((position) =>
        trading.decreasePosition({
          positionId: position.stableId,
          sizeDelta: position.size,
        })
      )
    );

    const failures = results.filter((r) => r.status === 'rejected').length;
    if (failures === 0) {
      toast.success('All positions closed');
    } else if (failures === results.length) {
      toast.error('Failed to close all positions');
    } else {
      toast.warning(`Closed ${results.length - failures}/${results.length} positions`);
    }
  }, [openPositions, trading]);

  return (
    <div css={$.container}>
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} css={$.tabsRoot}>
        <div css={$.tabsBar}>
          <Tabs.List css={$.tabsList}>
            <Tabs.Trigger value={TABS.POSITIONS} css={$.tabsTrigger}>
              Positions ({openPositions.length})
            </Tabs.Trigger>
            <Tabs.Trigger value={TABS.HISTORY} css={$.tabsTrigger}>
              Trade History
            </Tabs.Trigger>
            <Tabs.Trigger value={TABS.OPEN_ORDERS} css={$.tabsTrigger}>
              Open Orders
            </Tabs.Trigger>
            <Tabs.Trigger value={TABS.FUNDING_HISTORY} css={$.tabsTrigger}>
              Funding History
            </Tabs.Trigger>
          </Tabs.List>
          {activeTab === TABS.POSITIONS && openPositions.length > 0 && (
            <button css={$.closeAllButton} onClick={handleCloseAll}>
              Close All
            </button>
          )}
        </div>

        <Tabs.Content value={TABS.POSITIONS} css={$.tabsContent}>
          <PositionsList />
        </Tabs.Content>

        <Tabs.Content value={TABS.HISTORY} css={$.tabsContent}>
          <TradeHistoryList />
        </Tabs.Content>

        <Tabs.Content value={TABS.OPEN_ORDERS} css={$.tabsContent}>
          <OpenOrdersList />
        </Tabs.Content>

        <Tabs.Content value={TABS.FUNDING_HISTORY} css={$.tabsContent}>
          <FundingHistoryList />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

const TABS = {
  POSITIONS: 'positions',
  HISTORY: 'history',
  OPEN_ORDERS: 'open-orders',
  FUNDING_HISTORY: 'funding-history',
} as const;

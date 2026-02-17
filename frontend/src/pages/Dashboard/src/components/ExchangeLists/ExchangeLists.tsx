import { type FC, useCallback, useState } from 'react';
import { Tabs } from 'radix-ui';
import { toast } from 'react-toastify';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { PositionsList } from '../PositionsList';
import * as $ from './ExchangeLists.css';
import { TradeHistoryList } from './components/TradeHistoryList';

export const ExchangeLists: FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.POSITIONS);
  const trading = useTradingSdk();
  const openPositions = useSdkQuery(() => trading.getCurrentAccountOpenPositions());

  const handleCloseAll = useCallback(async () => {
    for (const position of openPositions) {
      try {
        await trading.decreasePosition({
          positionId: position.stableId,
          sizeDelta: position.size,
        });
      } catch (error) {
        toast.error(`Failed to close position`);
      }
    }
    toast.success('All positions closed');
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
      </Tabs.Root>
    </div>
  );
};

const TABS = {
  POSITIONS: 'positions',
  HISTORY: 'history',
} as const;

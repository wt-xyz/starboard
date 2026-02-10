import { type FC, useState } from 'react';
import { Tabs } from 'radix-ui';
import { PositionsList } from './PositionsList';
import * as styles from './PositionsTradeHistoryTabs.css';
import { TradeHistoryList } from './TradeHistoryList';

const TABS = {
  POSITIONS: 'positions',
  HISTORY: 'history',
} as const;

export const PositionsTradeHistoryTabs: FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.POSITIONS);

  return (
    <div css={styles.container}>
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List css={styles.tabsList}>
          <Tabs.Trigger value={TABS.POSITIONS} css={styles.tabsTrigger}>
            Positions
          </Tabs.Trigger>
          <Tabs.Trigger value={TABS.HISTORY} css={styles.tabsTrigger}>
            Trade History
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={TABS.POSITIONS} css={styles.tabsContent}>
          <PositionsList />
        </Tabs.Content>

        <Tabs.Content value={TABS.HISTORY} css={styles.tabsContent}>
          <TradeHistoryList />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

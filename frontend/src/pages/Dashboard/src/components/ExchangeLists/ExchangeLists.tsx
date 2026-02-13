import { type FC, useState } from 'react';
import { Tabs } from 'radix-ui';
import { PositionsList } from '../PositionsList';
import * as $ from './ExchangeLists.css';
import { TradeHistoryList } from './components/TradeHistoryList';

export const ExchangeLists: FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.POSITIONS);

  return (
    <div css={$.container}>
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} css={$.tabsRoot}>
        <Tabs.List css={$.tabsList}>
          <Tabs.Trigger value={TABS.POSITIONS} css={$.tabsTrigger}>
            Positions
          </Tabs.Trigger>
          <Tabs.Trigger value={TABS.HISTORY} css={$.tabsTrigger}>
            Trade History
          </Tabs.Trigger>
        </Tabs.List>

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

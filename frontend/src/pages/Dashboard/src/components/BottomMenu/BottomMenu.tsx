import { useState } from 'react';
import { Tabs } from 'radix-ui';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { propifyEl } from '@/lib/propify';
import { DashboardOrderEntryForm } from '../DashboardOrderEntryForm';
import { PositionsList } from '../PositionsList';
import * as $ from './BottomMenu.css';

export function BottomMenu() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<Side>('long');

  const handleBarClick = (side: Side) => {
    setActiveSide(side);
    setIsSheetOpen(true);
  };

  return (
    <>
      <div css={$.bar}>
        <LongButton
          data-active={isSheetOpen && activeSide === 'long'}
          onClick={() => handleBarClick('long')}
        />
        <div css={$.barSeparator} />
        <ShortButton
          data-active={isSheetOpen && activeSide === 'short'}
          onClick={() => handleBarClick('short')}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" showClose={false}>
          <div css={$.sheetContent}>
            <Tabs.Root value={activeSide} onValueChange={(v) => setActiveSide(v as Side)}>
              <Tabs.List css={$.tabsList}>
                <Tabs.Trigger value="long" css={$.tabsTrigger} data-tab="long">
                  Long
                </Tabs.Trigger>
                <Tabs.Trigger value="short" css={$.tabsTrigger} data-tab="short">
                  Short
                </Tabs.Trigger>
              </Tabs.List>

              <div css={$.tabsBody}>
                <Tabs.Content value="long" css={$.tabContent}>
                  <div css={$.orderEntryFormWrapper}>
                    <DashboardOrderEntryForm
                      key="long-form"
                      defaultOrderSide="long"
                      hideSideSwitch
                    />
                  </div>
                  <PositionsList key="long-positions" side="long" />
                </Tabs.Content>
                <Tabs.Content value="short" css={$.tabContent}>
                  <div css={$.orderEntryFormWrapper}>
                    <DashboardOrderEntryForm
                      key="short-form"
                      defaultOrderSide="short"
                      hideSideSwitch
                    />
                  </div>
                  <PositionsList key="short-positions" side="short" />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

type Side = 'long' | 'short';

const LongButton = propifyEl('button', {
  className: $.barButton,
  type: 'button',
  children: 'Long',
});
const ShortButton = propifyEl('button', {
  className: $.barButton,
  type: 'button',
  children: 'Short',
});

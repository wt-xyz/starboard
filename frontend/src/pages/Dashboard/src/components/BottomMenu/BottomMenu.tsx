import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Tabs } from 'radix-ui';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DashboardOrderEntryForm } from '../DashboardOrderEntryForm';
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
        <div css={$.buttonGroup}>
          <button
            type="button"
            css={$.sideButton}
            data-side="long"
            data-active={activeSide === 'long'}
            onClick={() => handleBarClick('long')}
          >
            Long
          </button>
          <button
            type="button"
            css={$.sideButton}
            data-side="short"
            data-active={activeSide === 'short'}
            onClick={() => handleBarClick('short')}
          >
            Short
          </button>
        </div>
        <button
          type="button"
          css={$.chevronButton}
          onClick={() => setIsSheetOpen(true)}
          aria-label="Expand trade panel"
        >
          <ChevronUpIcon />
        </button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" showClose={false}>
          <Tabs.Root
            value={activeSide}
            onValueChange={(v) => setActiveSide(v as Side)}
            css={$.sheetTabsRoot}
          >
            <div css={$.sheetHeader}>
              <Tabs.List css={$.buttonGroup}>
                <Tabs.Trigger
                  value="long"
                  css={$.sideButton}
                  data-side="long"
                  data-active={activeSide === 'long'}
                >
                  Long
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="short"
                  css={$.sideButton}
                  data-side="short"
                  data-active={activeSide === 'short'}
                >
                  Short
                </Tabs.Trigger>
              </Tabs.List>
              <button
                type="button"
                css={$.chevronButton}
                onClick={() => setIsSheetOpen(false)}
                aria-label="Collapse trade panel"
              >
                <ChevronDownIcon />
              </button>
            </div>

            <div css={$.sheetContent}>
              <div css={$.tabsBody}>
                <Tabs.Content value="long" css={$.tabContent}>
                  <div css={$.orderEntryFormWrapper}>
                    <DashboardOrderEntryForm
                      key="long-form"
                      defaultOrderSide="long"
                      hideSideSwitch
                    />
                  </div>
                </Tabs.Content>
                <Tabs.Content value="short" css={$.tabContent}>
                  <div css={$.orderEntryFormWrapper}>
                    <DashboardOrderEntryForm
                      key="short-form"
                      defaultOrderSide="short"
                      hideSideSwitch
                    />
                  </div>
                </Tabs.Content>
              </div>
            </div>
          </Tabs.Root>
        </SheetContent>
      </Sheet>
    </>
  );
}

type Side = 'long' | 'short';

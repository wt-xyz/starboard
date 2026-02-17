import { memo, useCallback } from 'react';
import { Dialog } from '@radix-ui/themes';
import type { PositionStableId } from 'fuel-ts-sdk';
import { Tabs } from 'radix-ui';
import * as styles from './DecreasePositionDialog.css';
import {
  CollateralTab,
  DecreaseTab,
  EntryPriceStat,
  LiquidationPriceStat,
  MarkPriceStat,
} from './components';

type DecreasePositionDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  positionId: PositionStableId;
};

export const DecreasePositionDialog = memo(
  ({ open, onOpenChange, positionId }: DecreasePositionDialogProps) => {
    const closeDialog = useCallback(() => {
      onOpenChange?.(false);
    }, [onOpenChange]);

    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Title className={styles.dialogTitle}>Manage Position</Dialog.Title>

          <div className={styles.statsRow}>
            <EntryPriceStat positionId={positionId} />
            <MarkPriceStat positionId={positionId} />
            <LiquidationPriceStat positionId={positionId} />
          </div>

          <Tabs.Root defaultValue="market">
            <Tabs.List className={styles.tabsList}>
              <Tabs.Trigger value="market" className={styles.tabsTrigger}>
                Market
              </Tabs.Trigger>
              <Tabs.Trigger value="limit" className={styles.tabsTrigger}>
                Limit
              </Tabs.Trigger>
              <Tabs.Trigger value="collateral" className={styles.tabsTrigger}>
                Collateral
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="market" className={styles.tabsContent} forceMount>
              <div className={styles.tabsContentInner}>
                <DecreaseTab positionId={positionId} onSubmitSuccess={closeDialog} />
              </div>
            </Tabs.Content>

            <Tabs.Content value="limit" className={styles.tabsContent} forceMount>
              <div className={styles.tabsContentInner}>
                <div className={styles.limitPlaceholder}>
                  Limit close orders coming soon
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="collateral" className={styles.tabsContent} forceMount>
              <div className={styles.tabsContentInner}>
                <CollateralTab positionId={positionId} onSubmitSuccess={closeDialog} />
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Root>
    );
  }
);

DecreasePositionDialog.displayName = 'DecreasePositionDialog';

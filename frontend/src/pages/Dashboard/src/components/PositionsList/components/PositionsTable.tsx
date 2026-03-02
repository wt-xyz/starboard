import { type FC, useCallback, useState } from 'react';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import type { PositionStableId } from 'fuel-ts-sdk';
import type { PositionEntity } from 'fuel-ts-sdk/trading';
import { toast } from 'react-toastify';
import { useBoolean } from 'usehooks-ts';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import { PositionsTable as PT } from '@/pages/Dashboard/submodules';
import { DecreasePositionDialog } from './DecreasePositionDialog';
import * as $ from './PositionsTable.css';

export interface PositionsTableProps {
  entries: PositionEntity[];
}

export const PositionsTable: FC<PositionsTableProps> = ({ entries }) => {
  return (
    <PT.Root
      header={
        <PT.Header>
          {(h) => (
            <>
              <h.Position />
              <h.Size />
              <h.NetValue />
              <h.Collateral />
              <h.EntryPrice />
              <h.MarkPrice />
              <h.LiqPrice />
              <h.Blank />
            </>
          )}
        </PT.Header>
      }
      body={entries.map((position) => (
        <PT.Row key={position.stableId} position={position}>
          {(r) => (
            <>
              <r.PositionCell />
              <r.SizeCell />
              <r.NetValueCell />
              <r.CollateralCell />
              <r.EntryPriceCell />
              <r.MarkPriceCell />
              <r.LiquidationPriceCell />
              <ActionsCell stableId={position.stableId} />
            </>
          )}
        </PT.Row>
      ))}
    />
  );
};

export const ActionsCell = (props: { stableId: PositionStableId }) => {
  const modalOpenBoolean = useBoolean();
  const confirmCloseBoolean = useBoolean();
  const [isClosing, setIsClosing] = useState(false);
  const trading = useTradingSdk();

  const handleMarketClose = useCallback(async () => {
    const position = trading.getPositionById(props.stableId);
    if (!position) {
      confirmCloseBoolean.setFalse();
      toast.error('Position not found');
      return;
    }
    confirmCloseBoolean.setFalse();
    setIsClosing(true);
    try {
      await trading.decreasePosition({
        positionId: props.stableId,
        sizeDelta: position.size,
      });
      toast.success('Position closed successfully');
    } catch (_error) {
      toast.error('Failed to close position');
    } finally {
      setIsClosing(false);
    }
  }, [trading, props.stableId, confirmCloseBoolean]);

  return (
    <td className={$.actionsCell}>
      <div className={$.actionsRow}>
        <button
          className={$.closeButton}
          onClick={confirmCloseBoolean.setTrue}
          disabled={isClosing}
        >
          {isClosing ? 'Closing...' : 'Close'}
        </button>
        <Tooltip content="Edit Position">
          <button
            className={$.iconButton}
            onClick={modalOpenBoolean.setTrue}
            aria-label="Edit position"
          >
            <HamburgerMenuIcon />
          </button>
        </Tooltip>
      </div>

      <ConfirmationDialog
        open={confirmCloseBoolean.value}
        onOpenChange={confirmCloseBoolean.setValue}
        title="Close Position"
        description="Close this position at market price?"
        confirmLabel="Close Position"
        variant="danger"
        onConfirm={handleMarketClose}
        loading={isClosing}
      />

      {modalOpenBoolean.value && (
        <DecreasePositionDialog
          positionId={props.stableId}
          open={modalOpenBoolean.value}
          onOpenChange={modalOpenBoolean.setValue}
        />
      )}
    </td>
  );
};

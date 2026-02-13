import type { FC } from 'react';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Tooltip } from '@radix-ui/themes';
import type { PositionStableId } from 'fuel-ts-sdk';
import type { PositionEntity } from 'fuel-ts-sdk/trading';
import { useBoolean } from 'usehooks-ts';
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

  return (
    <td>
      <Tooltip content="Edit Position">
        <button className={$.iconButton} onClick={modalOpenBoolean.setTrue}>
          <HamburgerMenuIcon />
        </button>
      </Tooltip>

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

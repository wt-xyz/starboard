import type { FC } from 'react';
import { type PositionEntity } from 'fuel-ts-sdk/trading';
import * as $ from './PositionTableRow.css';
import {
  ActionsCell,
  CollateralCell,
  NetValueCell,
  PositionCell,
  PriceCell,
  SizeCell,
} from './components';
import { PositionTableRowContext } from './lib/PositionTableRowContext';

type PositionTableRowProps = {
  position: PositionEntity;
};

export const PositionTableRow: FC<PositionTableRowProps> = ({ position }) => {
  return (
    <PositionTableRowContext.Provider value={position}>
      <tr css={$.tableRow}>
        <PositionCell />
        <SizeCell />
        <NetValueCell />
        <CollateralCell />
        <PriceCell type="entry" />
        <PriceCell type="mark" />
        <PriceCell type="liquidation" />
        <ActionsCell />
      </tr>
    </PositionTableRowContext.Provider>
  );
};

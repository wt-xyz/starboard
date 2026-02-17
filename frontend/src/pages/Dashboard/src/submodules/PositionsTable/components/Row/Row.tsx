import type { FC, ReactNode } from 'react';
import { type PositionEntity } from 'fuel-ts-sdk/trading';
import { propify } from '@/lib/propify';
import * as $ from './Row.css';
import {
  ActionCell,
  CollateralCell,
  FeesCell,
  NetValueCell,
  PnlDeltaCell,
  PositionCell,
  PriceCell,
  RealizedPnlCell,
  SizeCell,
  SizeDeltaCell,
  TimestampCell,
  TradeValueCell,
} from './components';
import { RowContext } from './contexts/RowContext';

type RowProps = {
  position: PositionEntity;

  children: (bag: typeof rowComponentsBag) => ReactNode;
};

export const Row: FC<RowProps> = ({ position, children }) => {
  return (
    <RowContext.Provider value={position}>
      <tr css={$.tableRow}>{children(rowComponentsBag)}</tr>
    </RowContext.Provider>
  );
};

const rowComponentsBag = {
  PositionCell,
  SizeCell,
  SizeDeltaCell,
  NetValueCell,
  CollateralCell,
  RealizedPnlCell,
  PnlDeltaCell,
  ActionCell,
  TimestampCell,
  TradeValueCell,
  FeesCell,
  EntryPriceCell: propify(PriceCell, { type: 'entry' }),
  MarkPriceCell: propify(PriceCell, { type: 'mark' }),
  LiquidationPriceCell: propify(PriceCell, { type: 'liquidation' }),
} as const;

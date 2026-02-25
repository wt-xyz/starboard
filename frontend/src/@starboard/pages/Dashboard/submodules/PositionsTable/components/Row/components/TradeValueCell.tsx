import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { Cell } from '@/pages/Dashboard/src/submodules/PositionsTable/components/Row/components/common/Cell';
import { RowContext } from '@/pages/Dashboard/src/submodules/PositionsTable/components/Row/contexts/RowContext';

export const TradeValueCell: FC = () => {
  const position = use(RowContext)!;
  const value = $decimalValue(position.collateralDelta).toFloat();

  return <Cell value={`$${formatCurrency(Math.abs(value))}`} />;
};

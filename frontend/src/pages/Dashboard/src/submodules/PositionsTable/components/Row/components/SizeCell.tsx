import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { RowContext } from '../contexts/RowContext';
import { Cell } from './common/Cell';

export const SizeCell: FC = () => {
  const position = use(RowContext)!;

  // Notional size of the position
  const sizeValue = $decimalValue(position.size).toFloat();
  const collateralValue = $decimalValue(position.collateral).toFloat();
  const leverage = collateralValue > 0 ? sizeValue / collateralValue : 0;

  return (
    <Cell value={`$${formatCurrency(Math.abs(sizeValue))}`} secondary={`${leverage.toFixed(1)}x`} />
  );
};

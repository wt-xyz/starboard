import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { RowContext } from '../contexts/RowContext';
import { Cell } from './common/Cell';

export const SizeDeltaCell: FC = () => {
  const position = use(RowContext)!;
  const value = $decimalValue(position.sizeDelta).toFloat();

  return <Cell value={`$${formatCurrency(Math.abs(value))}`} />;
};

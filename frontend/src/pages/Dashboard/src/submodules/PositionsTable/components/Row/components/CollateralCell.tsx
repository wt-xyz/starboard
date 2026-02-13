import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { RowContext } from '../contexts/RowContext';
import { Cell } from './common/Cell';

export const CollateralCell: FC = () => {
  const position = use(RowContext)!;
  const collateralValue = $decimalValue(position.collateral).toFloat();

  return <Cell value={`$${formatCurrency(collateralValue)}`} />;
};

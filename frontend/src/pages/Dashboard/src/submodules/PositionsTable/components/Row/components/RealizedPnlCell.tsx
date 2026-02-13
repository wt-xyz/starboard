import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { RowContext } from '../contexts/RowContext';
import * as $ from './RealizedPnlCell.css';
import { Cell } from './common/Cell';

export const RealizedPnlCell: FC = () => {
  const position = use(RowContext)!;
  const value = $decimalValue(position.realizedPnl).toFloat();
  const sign = value >= 0 ? '+' : '';
  const colorStyle = value > 0 ? $.positive : value < 0 ? $.negative : $.muted;

  return (
    <Cell
      value={
        <span css={colorStyle}>
          {sign}${formatCurrency(value)}
        </span>
      }
    />
  );
};

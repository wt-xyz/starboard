import { formatCurrency } from '@/lib/formatCurrency';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { $decimalValue } from 'fuel-ts-sdk';
import type { FC } from 'react';
import * as $ from '../PositionTableRow.css';
import { PositionTableRowContext } from '../lib/PositionTableRowContext';

export const SizeCell: FC = () => {
  const position = useRequiredContext(PositionTableRowContext);

  // Notional size of the position
  const sizeValue = $decimalValue(position.size).toFloat();
  const collateralValue = $decimalValue(position.collateral).toFloat();
  const leverage = collateralValue > 0 ? sizeValue / collateralValue : 0;

  return (
    <td css={$.cell}>
      <div css={$.cellContent}>
        <span css={$.cellValue}>
          ${formatCurrency(Math.abs(sizeValue))}
        </span>
        <span css={$.cellSecondary}>{leverage.toFixed(1)}x</span>
      </div>
    </td>
  );
};

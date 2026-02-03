import { formatCurrency } from '@/lib/formatCurrency';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { $decimalValue } from 'fuel-ts-sdk';
import type { FC } from 'react';
import * as $ from '../PositionTableRow.css';
import { PositionTableRowContext } from '../lib/PositionTableRowContext';

export const CollateralCell: FC = () => {
  const position = useRequiredContext(PositionTableRowContext);
  const collateralValue = $decimalValue(position.collateral).toFloat();

  return (
    <td css={$.cell}>
      <span css={$.cellValue}>${formatCurrency(collateralValue)}</span>
    </td>
  );
};

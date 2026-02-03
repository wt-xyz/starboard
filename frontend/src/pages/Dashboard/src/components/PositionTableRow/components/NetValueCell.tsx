import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { $decimalValue } from 'fuel-ts-sdk';
import { calculateUnrealizedPnl } from 'fuel-ts-sdk/trading';
import type { FC } from 'react';
import * as $ from '../PositionTableRow.css';
import { PositionTableRowContext } from '../lib/PositionTableRowContext';

export const NetValueCell: FC = () => {
  const position = useRequiredContext(PositionTableRowContext);
  const tradingSdk = useTradingSdk();
  const markPrice = useSdkQuery(() => tradingSdk.getAssetLatestPrice(position.assetId));

  const collateralValue = $decimalValue(position.collateral).toFloat();
  const pnl = markPrice ? calculateUnrealizedPnl(position, markPrice.value) : null;
  const pnlValue = pnl ? $decimalValue(pnl).toFloat() : null;
  const pnlPercent = pnlValue !== null && collateralValue > 0 ? (pnlValue / collateralValue) * 100 : null;
  const profitable = pnlValue !== null ? pnlValue >= 0 : null;

  // Net value = collateral + PnL
  const netValue = collateralValue + (pnlValue ?? 0);
  const pnlColorStyle = profitable === null ? $.muted : profitable ? $.positive : $.negative;

  return (
    <td css={$.cell}>
      <div css={$.cellContent}>
        <span css={$.cellValue}>${formatCurrency(netValue)}</span>
        {pnlValue !== null && pnlPercent !== null && (
          <span css={[$.cellSecondary, pnlColorStyle]}>
            {pnlValue >= 0 ? '+' : ''}${formatCurrency(pnlValue)} ({pnlPercent >= 0 ? '+' : ''}
            {pnlPercent.toFixed(2)}%)
          </span>
        )}
      </div>
    </td>
  );
};

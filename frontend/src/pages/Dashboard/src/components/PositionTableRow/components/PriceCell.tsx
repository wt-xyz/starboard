import type { FC } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { colors } from '@/styles/colors';
import * as $ from '../PositionTableRow.css';
import { PositionTableRowContext } from '../lib/PositionTableRowContext';

type PriceCellProps = {
  type: 'entry' | 'mark' | 'liquidation';
};

export const PriceCell: FC<PriceCellProps> = ({ type }) => {
  const position = useRequiredContext(PositionTableRowContext);
  const tradingSdk = useTradingSdk();

  const markPrice = useSdkQuery(() =>
    type === 'mark' ? tradingSdk.getAssetLatestPrice(position.assetId) : undefined
  );

  const liquidationPrice = useSdkQuery((sdk) =>
    type === 'liquidation'
      ? sdk.trading.getPositionLiquidationPriceApprox(position.stableId)
      : undefined
  );

  let priceValue: number | null = null;
  let warning = false;

  if (type === 'entry') {
    priceValue = $decimalValue(position.entryPrice).toFloat();
  } else if (type === 'mark' && markPrice) {
    priceValue = $decimalValue(markPrice.value).toFloat();
  } else if (type === 'liquidation' && liquidationPrice) {
    const liquidationPriceValue = $decimalValue(liquidationPrice).toFloat();
    priceValue = liquidationPriceValue;

    // Check if close to liquidation
    const markPriceValue = markPrice ? $decimalValue(markPrice.value).toFloat() : null;
    if (markPriceValue && liquidationPriceValue) {
      const liquidationDistance = Math.abs(
        ((markPriceValue - liquidationPriceValue) / markPriceValue) * 100
      );
      warning = liquidationDistance < 5;
    }
  }

  const cellStyle = warning ? { color: colors.error } : {};

  return (
    <td css={$.cell} style={cellStyle}>
      <span css={$.cellValue}>{priceValue ? `$${formatCurrency(priceValue)}` : '—'}</span>
    </td>
  );
};

import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { RowContext } from '../contexts/RowContext';
import { Cell } from './common/Cell';

type PriceCellProps = {
  type: 'entry' | 'mark' | 'liquidation';
};

export const PriceCell: FC<PriceCellProps> = ({ type }) => {
  const position = use(RowContext)!;
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

  return (
    <Cell
      value={priceValue ? `$${formatCurrency(priceValue)}` : '—'}
      variant={warning ? 'error' : undefined}
    />
  );
};

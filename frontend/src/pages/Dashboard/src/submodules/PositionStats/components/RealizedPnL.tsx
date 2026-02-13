import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface RealizedPnLProps {
  positionId: PositionStableId;
}

export const RealizedPnL: FC<RealizedPnLProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);

  if (!position) return <>—</>;

  const value = $decimalValue(position.realizedPnl).toFloat();
  const sign = value >= 0 ? '+' : '';

  return (
    <>
      {sign}${formatCurrency(value)}
    </>
  );
};

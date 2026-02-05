import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { calculateUnrealizedPnl } from 'fuel-ts-sdk/trading';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface UnrealizedPnLProps {
  positionId: PositionStableId;
}

export const UnrealizedPnL: FC<UnrealizedPnLProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);

  const markPrice = useSdkQuery(() =>
    position ? tradingSdk.getAssetLatestPrice(position.assetId) : null
  );

  if (!position || !markPrice) return <>—</>;

  const pnl = calculateUnrealizedPnl(position, markPrice.value);
  const value = $decimalValue(pnl).toFloat();
  const sign = value >= 0 ? '+' : '';

  return (
    <>
      {sign}${formatCurrency(value)}
    </>
  );
};

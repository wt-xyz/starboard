import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface MarkPriceProps {
  positionId: PositionStableId;
}

export const MarkPrice: FC<MarkPriceProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);
  const markPrice = useSdkQuery(() =>
    position ? tradingSdk.getAssetLatestPrice(position.assetId) : null
  );

  if (!markPrice) return <>—</>;

  const value = $decimalValue(markPrice.value).toFloat();
  return <>{formatCurrency(value)}</>;
};

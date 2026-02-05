import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface EntryPriceProps {
  positionId: PositionStableId;
}

export const EntryPrice: FC<EntryPriceProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);

  if (!position) return <>—</>;

  const value = $decimalValue(position.entryPrice).toFloat();
  return <>{formatCurrency(value)}</>;
};

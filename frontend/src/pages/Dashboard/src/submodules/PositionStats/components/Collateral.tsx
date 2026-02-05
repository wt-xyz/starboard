import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface CollateralProps {
  positionId: PositionStableId;
}

export const Collateral: FC<CollateralProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);

  if (!position) return <>—</>;

  const value = $decimalValue(position.collateral).toFloat();
  return <>{formatCurrency(value)}</>;
};

import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';

export interface LiquidationPriceProps {
  positionId: PositionStableId;
}

export const LiquidationPrice: FC<LiquidationPriceProps> = ({ positionId }) => {
  const liquidationPrice = useSdkQuery((sdk) =>
    sdk.trading.getPositionLiquidationPriceApprox(positionId)
  );

  if (!liquidationPrice) return <>—</>;

  const value = $decimalValue(liquidationPrice).toFloat();
  return <>{formatCurrency(value)}</>;
};

import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface LeverageProps {
  positionId: PositionStableId;
}

export const Leverage: FC<LeverageProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const leverage = tradingSdk.getPositionLeverage(positionId);

  if (leverage.value === '0') return <>0x</>;

  return <>{$decimalValue(leverage).toFloat().toFixed(1)}x</>;
};

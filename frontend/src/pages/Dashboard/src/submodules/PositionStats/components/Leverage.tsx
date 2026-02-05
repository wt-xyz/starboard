import type { FC } from 'react';
import { $decimalValue, DecimalCalculator, DecimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface LeverageProps {
  positionId: PositionStableId;
}

export const Leverage: FC<LeverageProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);

  if (!position) return <>—</>;

  if (position.collateral.value === '0') return <>0x</>;

  const leverage = DecimalCalculator.value(position.size)
    .divideBy(position.collateral)
    .calculate(DecimalValue);

  return <>{$decimalValue(leverage).toFloat().toFixed(1)}x</>;
};

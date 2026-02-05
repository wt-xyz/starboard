import type { FC } from 'react';
import {
  $decimalValue,
  CollateralAmount,
  DecimalCalculator,
  DecimalValue,
  type PositionStableId,
} from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';

export interface EstimatedPayoutProps {
  positionId: PositionStableId;
  sizeDelta?: string;
  totalSize?: string;
}

export const EstimatedPayout: FC<EstimatedPayoutProps> = ({ positionId, sizeDelta, totalSize }) => {
  const fullEquity = useSdkQuery((sdk) => sdk.trading.getPositionEquity(positionId));

  if (!fullEquity) return <>—</>;

  const payout = (() => {
    if (!sizeDelta || !totalSize) {
      return fullEquity;
    }

    const sizeDeltaDecimal = PositionSize.fromDecimalString(sizeDelta);
    const totalSizeDecimal = PositionSize.fromDecimalString(totalSize);

    const proportion = DecimalCalculator.value(sizeDeltaDecimal)
      .divideBy(totalSizeDecimal)
      .calculate(DecimalValue);

    return DecimalCalculator.value(fullEquity).multiplyBy(proportion).calculate(CollateralAmount);
  })();

  const value = $decimalValue(payout).toFloat();

  if (value < 0) return <>$0</>;

  return <>${formatCurrency(value)}</>;
};

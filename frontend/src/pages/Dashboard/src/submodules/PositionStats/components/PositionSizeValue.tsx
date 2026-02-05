import type { FC } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';

export interface PositionSizeValueProps {
  positionId: PositionStableId;
}

export const PositionSize: FC<PositionSizeValueProps> = ({ positionId }) => {
  const size = useSdkQuery((sdk) => sdk.trading.getPositionSizeInQuoteAsset(positionId));

  if (size == null) return <>--</>;

  return <>{formatCurrency($decimalValue(size).toDecimalString(), { compact: true })}</>;
};

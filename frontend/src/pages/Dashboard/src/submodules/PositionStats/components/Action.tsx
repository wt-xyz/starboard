import type { FC } from 'react';
import type { PositionStableId } from 'fuel-ts-sdk';
import { PositionChange } from 'fuel-ts-sdk/trading';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';

export interface ActionProps {
  positionId: PositionStableId;
}

export const Action: FC<ActionProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const position = tradingSdk.getPositionById(positionId);

  if (!position) return <>—</>;

  return <>{changeLabels[position.change]}</>;
};

const changeLabels: Record<PositionChange, string> = {
  [PositionChange.INCREASE]: 'Deposit',
  [PositionChange.DECREASE]: 'Withdraw',
  [PositionChange.CLOSE]: 'Close',
  [PositionChange.LIQUIDATE]: 'Liquidate',
};

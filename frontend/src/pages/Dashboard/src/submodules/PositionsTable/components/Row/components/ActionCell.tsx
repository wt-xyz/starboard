import { type FC, use } from 'react';
import { PositionChange } from 'fuel-ts-sdk/trading';
import { RowContext } from '../contexts/RowContext';
import { Cell } from './common/Cell';


export const ActionCell: FC = () => {
  const position = use(RowContext)!;
  
  return <Cell value={changeLabels[position.change]} />;
};

const changeLabels: Record<PositionChange, string> = {
  [PositionChange.INCREASE]: 'Deposit',
  [PositionChange.DECREASE]: 'Withdraw',
  [PositionChange.CLOSE]: 'Close',
  [PositionChange.LIQUIDATE]: 'Liquidate',
};
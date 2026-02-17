import { type FC, use } from 'react';
import { RowContext } from '../contexts/RowContext';
import { Cell } from './common/Cell';

export const TimestampCell: FC = () => {
  const position = use(RowContext)!;
  const date = new Date(position.timestamp * 1000);

  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return <Cell value={dateStr} secondary={timeStr} />;
};

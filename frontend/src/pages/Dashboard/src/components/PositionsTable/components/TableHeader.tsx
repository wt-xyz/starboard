import type { FC } from 'react';
import * as $ from '../PositionsTable.css';

export const TableHeader: FC = () => {
  return (
    <thead>
      <tr css={$.headerRow}>
        <th css={$.headerCell}>Position</th>
        <th css={$.headerCell}>Size</th>
        <th css={$.headerCell}>Net Value</th>
        <th css={$.headerCell}>Collateral</th>
        <th css={$.headerCell}>Entry Price</th>
        <th css={$.headerCell}>Mark Price</th>
        <th css={$.headerCell}>Liq. Price</th>
        <th css={$.headerCell}></th>
      </tr>
    </thead>
  );
};

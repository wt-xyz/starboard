import type { FC } from 'react';
import { type PositionEntity } from 'fuel-ts-sdk/trading';
import { PositionTableRow } from '../PositionTableRow';
import * as $ from './PositionsTable.css';
import { TableHeader } from './components/TableHeader';

type PositionsTableProps = {
  positions: PositionEntity[];
};

export const PositionsTable: FC<PositionsTableProps> = ({ positions }) => {
  return (
    <table css={$.table}>
      <TableHeader />
      <tbody>
        {positions.map((position) => (
          <PositionTableRow key={position.revisionId} position={position} />
        ))}
      </tbody>
    </table>
  );
};

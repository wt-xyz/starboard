import type { FC } from 'react';
import * as $ from './StarCell.css';

export const StarCell: FC = () => (
  <td css={$.starCell}>
    <button
      css={$.starButton}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      ☆
    </button>
  </td>
);

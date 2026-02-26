import type { FC } from 'react';
import * as $ from './StarCell.css';

export const StarCell: FC = () => (
  <td css={$.starCell}>
    <button
      css={$.starButton}
      aria-label="Add to watchlist"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      ☆
    </button>
  </td>
);

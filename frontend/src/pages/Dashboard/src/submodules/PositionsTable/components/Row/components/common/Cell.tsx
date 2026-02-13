import type { FC, ReactNode } from 'react';
import type { RecipeVariant } from '@/types/RecipeVariant';
import * as $ from './Cell.css';

export interface CellProps {
  value: ReactNode;
  secondary?: ReactNode;

  variant?: RecipeVariant<typeof $.cell, 'variant'>;
}

export const Cell: FC<CellProps> = ({ secondary, value, variant }) => (
  <td css={$.cell({ variant })}>
    <div css={$.cellContent}>
      {typeof value === 'string' && <span css={$.cellValue}>{value}</span>}
      {typeof value === 'object' && value}
      {typeof secondary === 'string' && <span css={$.cellSecondary}>{secondary}</span>}
      {typeof secondary === 'object' && secondary}
    </div>
  </td>
);

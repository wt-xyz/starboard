import type { FC } from 'react';
import * as $ from '../AssetRow.css';

export const AvailableLiqCell: FC = () => (
  <td css={$.cell}>
    <span css={$.muted}>--</span>
  </td>
);

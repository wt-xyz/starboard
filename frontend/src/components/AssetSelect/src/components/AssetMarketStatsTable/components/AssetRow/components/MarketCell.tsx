import type { FC } from 'react';
import { ASSET_ICONS, formatSymbol } from '../../../../../AssetSelect.utils';
import * as $ from './MarketCell.css';

type MarketCellProps = {
  symbol: string;
};

export const MarketCell: FC<MarketCellProps> = ({ symbol }) => (
  <td>
    <div css={$.marketCell}>
      {ASSET_ICONS[symbol] && <img src={ASSET_ICONS[symbol]} alt="" css={$.assetIcon} />}
      <span css={$.assetName}>{formatSymbol(symbol)}</span>
    </div>
  </td>
);

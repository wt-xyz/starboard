import { type FC, use } from 'react';
import { PositionSide } from 'fuel-ts-sdk/trading';
import { ASSET_ICONS, formatSymbol } from '@/components/AssetSelect/src/AssetSelect.utils';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { RowContext } from '../contexts/RowContext';
import * as $ from './PositionCall.css';
import { Cell } from './common/Cell';

export const PositionCell: FC = () => {
  const position = use(RowContext)!;
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getAssetById(position.assetId));

  const isLong = position.side === PositionSide.LONG;
  const symbol = asset?.symbol ?? '';

  return (
    <Cell
      value={
        <div css={$.assetInfo}>
          {ASSET_ICONS[symbol] && <img src={ASSET_ICONS[symbol]} alt="" css={$.assetIcon} />}
          <span css={$.assetSymbol}>{symbol ? formatSymbol(symbol) : asset?.name}</span>
          <span css={[$.side, isLong ? $.sideLong : $.sideShort]}>{isLong ? 'LONG' : 'SHORT'}</span>
        </div>
      }
    />
  );
};

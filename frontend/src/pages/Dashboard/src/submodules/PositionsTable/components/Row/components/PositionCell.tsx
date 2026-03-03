import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
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

  const rawLeverage = tradingSdk.getPositionLeverage(position.stableId);
  const leverage =
    rawLeverage.value === '0' ? '0x' : `${$decimalValue(rawLeverage).toFloat().toFixed(1)}x`;

  return (
    <Cell
      value={
        <div css={$.assetInfo}>
          {ASSET_ICONS[symbol] && <img src={ASSET_ICONS[symbol]} alt="" css={$.assetIcon} />}
          <div css={$.assetMeta}>
            <span css={$.assetSymbol}>{symbol ? formatSymbol(symbol) : asset?.name}</span>
            <div css={$.assetSubRow}>
              <span css={$.assetLeverage}>{leverage}</span>
              <span css={[$.side, isLong ? $.sideLong : $.sideShort]}>
                {isLong ? 'LONG' : 'SHORT'}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
};

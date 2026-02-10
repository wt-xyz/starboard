import type { FC } from 'react';
import { PositionSide } from 'fuel-ts-sdk/trading';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import * as $ from '../PositionTableRow.css';
import { PositionTableRowContext } from '../lib/PositionTableRowContext';

export const PositionCell: FC = () => {
  const position = useRequiredContext(PositionTableRowContext);
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getAssetById(position.assetId));

  const isLong = position.side === PositionSide.LONG;

  return (
    <td css={$.cell}>
      <div css={$.assetInfo}>
        <span css={[$.side, isLong ? $.sideLong : $.sideShort]}>{isLong ? 'LONG' : 'SHORT'}</span>
        <span css={$.assetSymbol}>{asset?.name}</span>
      </div>
    </td>
  );
};

import type { FC } from 'react';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { PositionStats } from '@/pages/Dashboard/submodules';
import { PositionCardContext } from '../../lib/PositionCardContext';
import * as $ from './_PositionStatsBase.css';

export const PositionSize: FC = () => {
  const position = useRequiredContext(PositionCardContext);
  const tradingSdk = useTradingSdk();

  const asset = useSdkQuery(() => tradingSdk.getAssetById(position.assetId));
  const baseAsset = asset?.name?.split('/')[0];

  return (
    <div css={$.statCell}>
      <span css={$.statLabel}>{baseAsset ? `Size (${baseAsset})` : 'Size'}</span>
      <span css={$.statValue}>
        <PositionStats.PositionSize positionId={position.stableId} />
      </span>
      <span css={$.statValueSecondary}>
        <PositionStats.Leverage positionId={position.stableId} />
      </span>
    </div>
  );
};

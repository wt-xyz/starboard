import type { FC } from 'react';
import { MinusIcon } from '@radix-ui/react-icons';
import { PositionSide } from 'fuel-ts-sdk/trading';
import { useBoolean } from 'usehooks-ts';
import { ASSET_ICONS, formatSymbol } from '@/components/AssetSelect/src/AssetSelect.utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { DecreasePositionDialog } from '../../DecreasePositionDialog';
import { PositionCardContext } from '../lib/PositionCardContext';
import * as $ from './CardHeader.css';

export const CardHeader: FC = () => {
  const modalOpenBoolean = useBoolean();
  const position = useRequiredContext(PositionCardContext);
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getAssetById(position.assetId));

  const isLong = position.side === PositionSide.LONG;
  const symbol = asset?.symbol ?? '';

  return (
    <div css={$.positionHeader}>
      <div css={$.assetId}>
        {ASSET_ICONS[symbol] && <img src={ASSET_ICONS[symbol]} alt="" css={$.assetIcon} />}
        <div css={$.assetInfo}>
          <span css={$.assetSymbol}>{symbol ? formatSymbol(symbol) : asset?.name}</span>
        </div>
        <span css={[$.side, isLong ? $.sideLong : $.sideShort]}>{isLong ? 'LONG' : 'SHORT'}</span>
      </div>
      <div css={$.headerActions}>
        <Tooltip content="Decrease or close position">
          <button
            type="button"
            className={$.iconButton}
            onClick={modalOpenBoolean.setTrue}
            aria-label="Decrease or close position"
          >
            <MinusIcon />
          </button>
        </Tooltip>
      </div>

      {modalOpenBoolean.value && (
        <DecreasePositionDialog
          positionId={position.stableId}
          open={modalOpenBoolean.value}
          onOpenChange={modalOpenBoolean.setValue}
        />
      )}
    </div>
  );
};

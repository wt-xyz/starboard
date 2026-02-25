import type { FC } from 'react';
import type { AssetId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from '../AssetRow.css';

type OpenInterestCellProps = {
  assetId: AssetId;
};

export const OpenInterestCell: FC<OpenInterestCellProps> = ({ assetId }) => {
  const sdk = useTradingSdk();
  const total = useSdkQuery(() => sdk.getAssetOpenInterestTotal(assetId));
  const longPct = useSdkQuery(() => sdk.getAssetOpenInterestLongPct(assetId));
  const shortPct = useSdkQuery(() => sdk.getAssetOpenInterestShortPct(assetId));

  if (total === null) {
    return (
      <td css={$.cell}>
        <span css={$.muted}>--</span>
      </td>
    );
  }

  const longDisplay = longPct !== null ? Math.round(longPct * 100) : null;
  const shortDisplay = shortPct !== null ? Math.round(shortPct * 100) : null;

  return (
    <td css={$.cell}>
      <div css={$.dualValue}>
        <span css={$.longValue}>{formatCurrency(total, { compact: true, symbol: '$' })}</span>
        {longDisplay !== null && shortDisplay !== null && (
          <span css={$.muted}>
            {longDisplay}L/{shortDisplay}S
          </span>
        )}
      </div>
    </td>
  );
};

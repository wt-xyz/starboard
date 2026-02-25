import type { FC } from 'react';
import type { AssetId } from 'fuel-ts-sdk';
import { formatPercentage } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from '../AssetRow.css';

type Change24hCellProps = {
  assetId: AssetId;
};

export const Change24hCell: FC<Change24hCellProps> = ({ assetId }) => {
  const sdk = useTradingSdk();
  const change24h = useSdkQuery(() => sdk.getAssetPriceChange24h(assetId));

  return (
    <td css={$.cell}>
      {change24h !== null ? (
        <span css={change24h >= 0 ? $.positive : $.negative}>
          {formatPercentage(change24h, { decimals: 2, signDisplay: 'always' })}
        </span>
      ) : (
        <span css={$.muted}>--</span>
      )}
    </td>
  );
};

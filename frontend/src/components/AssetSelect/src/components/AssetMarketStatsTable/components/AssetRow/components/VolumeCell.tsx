import type { FC } from 'react';
import type { AssetId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from '../AssetRow.css';

type VolumeCellProps = {
  assetId: AssetId;
};

export const VolumeCell: FC<VolumeCellProps> = ({ assetId }) => {
  const sdk = useTradingSdk();
  const volume = useSdkQuery(() => sdk.getAssetVolume24h(assetId));

  return (
    <td css={$.cell}>
      {volume !== null ? (
        formatCurrency(volume, { compact: true, symbol: '$' })
      ) : (
        <span css={$.muted}>--</span>
      )}
    </td>
  );
};

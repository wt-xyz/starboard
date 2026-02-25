import type { FC } from 'react';
import { $decimalValue, type AssetId } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from '../AssetRow.css';

type LastPriceCellProps = {
  assetId: AssetId;
};

export const LastPriceCell: FC<LastPriceCellProps> = ({ assetId }) => {
  const sdk = useTradingSdk();
  const price = useSdkQuery(() => sdk.getAssetLatestPrice(assetId));
  const priceValue = price ? $decimalValue(price.value).toFloat() : null;

  return (
    <td css={$.cell}>
      {priceValue !== null ? (
        `$${formatCurrency(priceValue.toString())}`
      ) : (
        <span css={$.muted}>--</span>
      )}
    </td>
  );
};

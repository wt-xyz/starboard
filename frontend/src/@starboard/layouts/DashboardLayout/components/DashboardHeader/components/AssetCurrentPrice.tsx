import { type FC, useEffect, useMemo } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { calculatePriceChange } from '@/@starboard/lib/calculatePriceChange';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from '@/layouts/DashboardLayout/src/views/DashboardLayout/components/DashboardHeader/components/AssetCurrentPrice.css';

export const AssetCurrentPrice: FC = () => {
  const sdk = useTradingSdk();
  const watchedAsset = useSdkQuery(sdk.getWatchedAsset);
  const price = useSdkQuery(sdk.getWatchedAssetLatestPrice);
  const candles = useSdkQuery(() =>
    watchedAsset ? sdk.getCandles(watchedAsset.assetId, 'H1') : []
  );

  useEffect(() => {
    if (!watchedAsset) return;
    const status = sdk.getCandlesStatus(watchedAsset.assetId, 'H1');
    if (status === 'uninitialized') {
      sdk.fetchCandles(watchedAsset.assetId, 'H1');
    }
  }, [sdk, watchedAsset]);

  const priceValue = price ? $decimalValue(price.value).toFloat() : 0;
  const sdkChange24h = useSdkQuery(() =>
    watchedAsset ? sdk.getAssetPriceChange24h(watchedAsset.assetId) : null
  );
  const change24h = useMemo(
    () => calculatePriceChange(price, candles) ?? sdkChange24h ?? null,
    [price, candles, sdkChange24h]
  );

  const changeStyles = [$.priceChange];
  if (change24h !== null) {
    changeStyles.push(change24h >= 0 ? $.priceChangePositive : $.priceChangeNegative);
  }

  return (
    <div css={$.priceDisplay}>
      <span css={$.price}>${formatCurrency(priceValue.toString())}</span>
      {change24h !== null && (
        <span css={changeStyles}>
          {formatPercentage(change24h, { decimals: 2, signDisplay: 'always' })}
        </span>
      )}
    </div>
  );
};

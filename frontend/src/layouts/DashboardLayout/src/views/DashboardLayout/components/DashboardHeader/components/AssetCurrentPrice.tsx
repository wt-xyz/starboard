import { type FC, useEffect } from 'react';
import { $decimalValue, OraclePrice } from 'fuel-ts-sdk';
import type { AssetPriceEntity, Candle } from 'fuel-ts-sdk/trading';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from './AssetCurrentPrice.css';

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
  const change24h = calculatePriceChange(price, candles) ?? sdkChange24h ?? null;

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

const TWENTY_FOUR_HOURS_S = 24 * 60 * 60;

function calculatePriceChange(
  currentPrice: AssetPriceEntity | undefined,
  candles: Candle[] | undefined
): number | null {
  if (!currentPrice || !candles || candles.length === 0) return null;

  const now = Date.now() / 1000;
  const target = now - TWENTY_FOUR_HOURS_S;

  // Find the candle closest to 24h ago (candles are ordered oldest-first)
  let closest = candles[0];
  for (const c of candles) {
    if (Math.abs(c.startedAt - target) < Math.abs(closest.startedAt - target)) {
      closest = c;
    }
  }

  const current = $decimalValue(currentPrice.value).toFloat();
  const open = $decimalValue(OraclePrice.fromBigIntString(closest.openPrice)).toFloat();

  if (open === 0) return null;
  return (current - open) / open;
}

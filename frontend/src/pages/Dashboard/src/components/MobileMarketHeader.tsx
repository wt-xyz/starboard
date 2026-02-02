import { AssetSelect } from '@/layouts/DashboardLayout/src/views/DashboardLayout/components/DashboardHeader/components/AssetSelect';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { $decimalValue, OraclePrice } from 'fuel-ts-sdk';
import type { AssetPriceEntity, Candle } from 'fuel-ts-sdk/trading';
import type { FC } from 'react';
import * as styles from './MobileMarketHeader.css';

export const MobileMarketHeader: FC = () => {
  const sdk = useTradingSdk();
  const watchedAsset = useSdkQuery(sdk.getWatchedAsset);
  const price = useSdkQuery(sdk.getWatchedAssetLatestPrice);
  const candles = useSdkQuery(() =>
    watchedAsset ? sdk.getCandles(watchedAsset.assetId, 'D1') : []
  );

  const change24h = calculatePriceChange(price, candles);
  const priceValue = price ? $decimalValue(price.value).toFloat() : 0;

  const changeStyles = [styles.priceChange];
  if (change24h !== null) {
    changeStyles.push(change24h >= 0 ? styles.priceChangePositive : styles.priceChangeNegative);
  }

  const getAssetPriceFormatted = (priceValue: string, currentDecimal = 0) => {
    if (currentDecimal === 9) return formatCurrency(0);
    const nextPriceValue = formatCurrency(Number(priceValue), { decimals: currentDecimal });
    if (Number(nextPriceValue) === 0) return getAssetPriceFormatted(priceValue, currentDecimal + 1);

    return formatCurrency(Number(priceValue), { decimals: currentDecimal + 2 });
  };

  return (
    <div css={styles.container}>
      <div css={styles.assetSection}>
        <AssetSelect />
      </div>

      <div css={styles.priceSection}>
        <span css={styles.price}>${getAssetPriceFormatted(priceValue.toString())}</span>
        {change24h !== null && (
          <span css={changeStyles}>
            {formatPercentage(change24h, { decimals: 2, signDisplay: 'always' })}
          </span>
        )}
      </div>
    </div>
  );
};

function calculatePriceChange(
  currentPrice: AssetPriceEntity | undefined,
  candles: Candle[] | undefined
): number | null {
  if (!currentPrice || !candles || candles.length === 0) return null;

  const current = $decimalValue(currentPrice.value).toFloat();
  const openCandle = candles[0]; // oldest candle (24h ago) - candles are ordered oldest-first
  const open = $decimalValue(OraclePrice.fromBigIntString(openCandle.openPrice)).toFloat();

  if (open === 0) return null;
  return (current - open) / open;
}

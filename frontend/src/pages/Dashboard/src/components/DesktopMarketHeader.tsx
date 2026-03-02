import { type FC, useEffect, useMemo } from 'react';
import {
  $decimalValue,
  DecimalCalculator,
  DecimalValue,
  createDecimalValueSchema,
} from 'fuel-ts-sdk';
import type { FundingInfoEntity } from 'fuel-ts-sdk/trading';
import { calculatePriceChange } from '@/lib/calculatePriceChange';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from './DesktopMarketHeader.css';

export const DesktopMarketHeader: FC = () => {
  const trading = useTradingSdk();
  const watchedAsset = useSdkQuery(trading.getWatchedAsset);
  const price = useSdkQuery(trading.getWatchedAssetLatestPrice);
  const candles = useSdkQuery(() =>
    watchedAsset ? trading.getCandles(watchedAsset.assetId, 'H1') : []
  );
  const marketStats = useSdkQuery((s) => s.trading.getWatchedAssetMarketStats());

  useEffect(() => {
    if (!watchedAsset) return;
    const status = trading.getCandlesStatus(watchedAsset.assetId, 'H1');
    if (status === 'uninitialized') {
      trading.fetchCandles(watchedAsset.assetId, 'H1');
    }
  }, [trading, watchedAsset]);

  const change24h = useMemo(() => calculatePriceChange(price, candles), [price, candles]);
  const priceValue = price ? $decimalValue(price.value).toFloat() : 0;

  const oiFormatted = useMemo(() => {
    if (!marketStats) return null;
    const longValue = $decimalValue(marketStats.openInterestLong).toFloat();
    const shortValue = $decimalValue(marketStats.openInterestShort).toFloat();
    if (!Number.isFinite(longValue) || !Number.isFinite(shortValue)) return null;
    const total = longValue + shortValue;
    if (total === 0) return '$0';
    return formatCurrency(total, { compact: true, symbol: '$' });
  }, [marketStats]);

  const volFormatted = useMemo(() => {
    if (!marketStats?.volume24h) return null;
    const value = $decimalValue(marketStats.volume24h).toFloat();
    return formatCurrency(value, { compact: true, symbol: '$' });
  }, [marketStats?.volume24h]);

  const fundingInfo = useSdkQuery((sdk) => sdk.trading.getWatchedAssetFundingInfo());
  const { fundingFormatted, fundingVariant } = useFundingRate(fundingInfo);

  return (
    <div css={$.container}>
      <div css={$.priceGroup}>
        <span css={$.price}>${formatPrice(priceValue)}</span>
        {change24h !== null && (
          <span css={change24h >= 0 ? $.priceChangePositive : $.priceChangeNegative}>
            {formatPercentage(change24h, { decimals: 2, signDisplay: 'always' })}
          </span>
        )}
      </div>

      {(oiFormatted || volFormatted || fundingFormatted) && <div css={$.separator} />}

      {oiFormatted && (
        <div css={$.statItem}>
          <span css={$.statLabel}>Open Interest</span>
          <span css={$.statValue}>{oiFormatted}</span>
        </div>
      )}

      {volFormatted && (
        <div css={$.statItem}>
          <span css={$.statLabel}>24h Volume</span>
          <span css={$.statValue}>{volFormatted}</span>
        </div>
      )}

      {fundingFormatted && (
        <div css={$.statItem}>
          <span css={$.statLabel}>Funding / hr</span>
          <span
            css={
              fundingVariant === 'positive'
                ? $.statValuePositive
                : fundingVariant === 'negative'
                  ? $.statValueNegative
                  : $.statValue
            }
          >
            {fundingFormatted}
          </span>
        </div>
      )}
    </div>
  );
};

type FundingResult = {
  fundingFormatted: string | null;
  fundingVariant: 'default' | 'positive' | 'negative';
};
function useFundingRate(fundingInfo: FundingInfoEntity | undefined): FundingResult {
  return useMemo(() => {
    if (!fundingInfo) {
      return { fundingFormatted: null, fundingVariant: 'default' as const };
    }

    const totalLongs = $decimalValue(fundingInfo.totalLongSizes).toBigInt();
    const totalShorts = $decimalValue(fundingInfo.totalShortSizes).toBigInt();

    if (totalLongs === 0n && totalShorts === 0n) {
      return { fundingFormatted: '0.0000%', fundingVariant: 'default' as const };
    }

    if (totalLongs > totalShorts) {
      const sizeDelta = DecimalCalculator.value(fundingInfo.totalLongSizes)
        .subtractBy(fundingInfo.totalShortSizes)
        .calculate();
      const rate = $decimalValue(
        DecimalCalculator.value(sizeDelta)
          .multiplyBy(FUNDING_RATE_FACTOR)
          .multiplyBy(SECONDS_PER_HOUR)
          .multiplyBy(PERCENT)
          .divideBy(fundingInfo.totalLongSizes)
          .calculate(DecimalValue)
      ).toFloat();
      return { fundingFormatted: `-${rate.toFixed(4)}% L`, fundingVariant: 'negative' as const };
    }

    if (totalShorts > totalLongs) {
      const sizeDelta = DecimalCalculator.value(fundingInfo.totalShortSizes)
        .subtractBy(fundingInfo.totalLongSizes)
        .calculate();
      const rate = $decimalValue(
        DecimalCalculator.value(sizeDelta)
          .multiplyBy(FUNDING_RATE_FACTOR)
          .multiplyBy(SECONDS_PER_HOUR)
          .multiplyBy(PERCENT)
          .divideBy(fundingInfo.totalShortSizes)
          .calculate(DecimalValue)
      ).toFloat();
      return { fundingFormatted: `+${rate.toFixed(4)}% S`, fundingVariant: 'positive' as const };
    }

    return { fundingFormatted: '0.0000%', fundingVariant: 'default' as const };
  }, [fundingInfo]);
}

function formatPrice(value: number): string {
  if (value === 0) return '0.00';
  for (let d = 0; d <= 9; d++) {
    if (Number(value.toFixed(d)) !== 0) {
      return formatCurrency(value, { decimals: d + 2 });
    }
  }
  return formatCurrency(0);
}

const FUNDING_RATE_FACTOR = DecimalValue.fromBigInt(23n);

const Scalar = createDecimalValueSchema(0, 'Scalar');

const SECONDS_PER_HOUR = Scalar.fromBigInt(3600n);

const PERCENT = Scalar.fromBigInt(100n);

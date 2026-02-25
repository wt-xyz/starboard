import { type FC, useEffect, useMemo } from 'react';
import {
  $decimalValue,
  DecimalCalculator,
  DecimalValue,
  createDecimalValueSchema,
} from 'fuel-ts-sdk';
import type { FundingInfoEntity } from 'fuel-ts-sdk/trading';
import { calculatePriceChange } from '@/@starboard/lib/calculatePriceChange';
import { AssetSelect } from '@/layouts/DashboardLayout/src/views/DashboardLayout/components/DashboardHeader/components/AssetSelect';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as styles from './MobileMarketHeader.css';

export const MobileMarketHeader: FC = () => {
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

  // OI
  const oiFormatted = useMemo(() => {
    if (!marketStats) return null;
    const longValue = $decimalValue(marketStats.openInterestLong).toFloat();
    const shortValue = $decimalValue(marketStats.openInterestShort).toFloat();
    if (!Number.isFinite(longValue) || !Number.isFinite(shortValue)) return null;
    const total = longValue + shortValue;
    if (total === 0) return '$0';
    return formatCurrency(total, { compact: true, symbol: '$' });
  }, [marketStats]);

  // Volume
  const volFormatted = useMemo(() => {
    if (!marketStats?.volume24h) return null;
    const value = $decimalValue(marketStats.volume24h).toFloat();
    return formatCurrency(value, { compact: true, symbol: '$' });
  }, [marketStats?.volume24h]);

  // Funding
  const fundingInfo = useSdkQuery((sdk) => sdk.trading.getWatchedAssetFundingInfo());
  const { fundingFormatted, fundingVariant } = useMobileFunding(fundingInfo);

  const getAssetPriceFormatted = (priceValue: string, currentDecimal = 0) => {
    if (currentDecimal === 9) return formatCurrency(0);
    const nextPriceValue = formatCurrency(Number(priceValue), { decimals: currentDecimal });
    if (Number(nextPriceValue) === 0) return getAssetPriceFormatted(priceValue, currentDecimal + 1);

    return formatCurrency(Number(priceValue), { decimals: currentDecimal + 2 });
  };

  return (
    <div css={styles.container}>
      <div css={styles.topRow}>
        <div css={styles.assetSection}>
          <AssetSelect />
        </div>

        <div css={styles.priceSection}>
          <span css={styles.price}>${getAssetPriceFormatted(priceValue.toString())}</span>
        </div>
      </div>

      <div css={styles.statsRow}>
        {change24h !== null && (
          <span css={styles.statItem}>
            <span css={styles.statLabel}>24h</span>
            <span css={change24h >= 0 ? styles.priceChangePositive : styles.priceChangeNegative}>
              {formatPercentage(change24h, { decimals: 2, signDisplay: 'always' })}
            </span>
          </span>
        )}
        {oiFormatted && (
          <span css={styles.statItem}>
            <span css={styles.statLabel}>OI</span>
            <span css={styles.statValue}>{oiFormatted}</span>
          </span>
        )}
        {volFormatted && (
          <span css={styles.statItem}>
            <span css={styles.statLabel}>Vol</span>
            <span css={styles.statValue}>{volFormatted}</span>
          </span>
        )}
        {fundingFormatted && (
          <span css={styles.statItem}>
            <span css={styles.statLabel}>Fund</span>
            <span
              css={
                fundingVariant === 'positive'
                  ? styles.priceChangePositive
                  : fundingVariant === 'negative'
                    ? styles.priceChangeNegative
                    : styles.statValue
              }
            >
              {fundingFormatted}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

const Scalar = createDecimalValueSchema(0, 'Scalar');
const FUNDING_RATE_FACTOR = DecimalValue.fromBigInt(23n);
const SECONDS_PER_HOUR = Scalar.fromBigInt(3600n);
const PERCENT = Scalar.fromBigInt(100n);

type FundingResult = {
  fundingFormatted: string | null;
  fundingVariant: 'default' | 'positive' | 'negative';
};

function useMobileFunding(fundingInfo: FundingInfoEntity | undefined): FundingResult {
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

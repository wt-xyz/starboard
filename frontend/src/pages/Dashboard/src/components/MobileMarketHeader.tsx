import { type FC, useEffect, useMemo, useState } from 'react';
import { $decimalValue, OraclePrice } from 'fuel-ts-sdk';
import type { FundingInfo, RequestStatus } from 'fuel-ts-sdk';
import type { AssetPriceEntity, Candle } from 'fuel-ts-sdk/trading';
import { AssetSelect } from '@/layouts/DashboardLayout/src/views/DashboardLayout/components/DashboardHeader/components/AssetSelect';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import { useSdk, useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as styles from './MobileMarketHeader.css';

export const MobileMarketHeader: FC = () => {
  const sdk = useTradingSdk();
  const tradingSdk = useSdk();
  const watchedAsset = useSdkQuery(sdk.getWatchedAsset);
  const price = useSdkQuery(sdk.getWatchedAssetLatestPrice);
  const candles = useSdkQuery(() =>
    watchedAsset ? sdk.getCandles(watchedAsset.assetId, 'D1') : []
  );
  const marketStats = useSdkQuery((s) => s.trading.getWatchedAssetMarketStats());

  useEffect(() => {
    if (!watchedAsset) return;
    const status = sdk.getCandlesStatus(watchedAsset.assetId, 'D1');
    if (status === 'uninitialized') {
      sdk.fetchCandles(watchedAsset.assetId, 'D1');
    }
  }, [sdk, watchedAsset]);

  const change24h = calculatePriceChange(price, candles);
  const priceValue = price ? $decimalValue(price.value).toFloat() : 0;

  // OI
  const oiFormatted = useMemo(() => {
    if (!marketStats) return null;
    const longValue = $decimalValue(marketStats.openInterestLong).toFloat();
    const shortValue = $decimalValue(marketStats.openInterestShort).toFloat();
    if (!Number.isFinite(longValue) || !Number.isFinite(shortValue)) return null;
    const total = longValue + shortValue;
    if (total === 0) return '$0';
    const longPct = Math.round((longValue / total) * 100);
    const shortPct = 100 - longPct;
    return `${formatCurrency(total, { compact: true, symbol: '$' })} (${longPct}L/${shortPct}S)`;
  }, [marketStats]);

  // Volume
  const volFormatted = useMemo(() => {
    if (!marketStats?.volume24h) return null;
    const value = $decimalValue(marketStats.volume24h).toFloat();
    return formatCurrency(value, { compact: true, symbol: '$' });
  }, [marketStats?.volume24h]);

  // Funding
  const { fundingFormatted, fundingVariant } = useMobileFunding(tradingSdk, watchedAsset);

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
      <div css={styles.topRow}>
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

      <div css={styles.statsRow}>
        {change24h !== null && (
          <span css={[styles.statItem, change24h >= 0 ? styles.priceChangePositive : styles.priceChangeNegative]}>
            24h: {formatPercentage(change24h, { decimals: 2, signDisplay: 'always' })}
          </span>
        )}
        {oiFormatted && <span css={styles.statItem}>OI: {oiFormatted}</span>}
        {volFormatted && <span css={styles.statItem}>Vol: {volFormatted}</span>}
        {fundingFormatted && (
          <span css={[styles.statItem, fundingVariant === 'positive' ? styles.priceChangePositive : fundingVariant === 'negative' ? styles.priceChangeNegative : undefined]}>
            Fund: {fundingFormatted}
          </span>
        )}
      </div>
    </div>
  );
};

const FUNDING_RATE_FACTOR = 23n;
const FUNDING_RATE_FACTOR_BASE = 1_000_000_000n;
const SECONDS_PER_HOUR = 3600n;

function useMobileFunding(
  sdk: ReturnType<typeof useSdk>,
  watchedAsset: ReturnType<typeof useSdkQuery<any>> | undefined
) {
  const [fetchStatus, setFetchStatus] = useState<RequestStatus>('uninitialized');
  const [fundingInfo, setFundingInfo] = useState<FundingInfo>();

  useEffect(() => {
    if (!watchedAsset) return;
    if (
      (fetchStatus === 'fulfilled' && fundingInfo?.assetId !== watchedAsset.assetId) ||
      fetchStatus === 'uninitialized'
    ) {
      setFetchStatus('pending');
      sdk.__extra
        .getFundingInfo(watchedAsset.assetId)
        .then((info) => {
          setFundingInfo(info);
          setFetchStatus('fulfilled');
        })
        .catch(() => {
          setFetchStatus('rejected');
        });
    }
  }, [fetchStatus, fundingInfo?.assetId, sdk.__extra, watchedAsset]);

  return useMemo(() => {
    if (!fundingInfo || fetchStatus !== 'fulfilled') {
      return { fundingFormatted: null, fundingVariant: 'default' as const };
    }

    const totalLongs = BigInt(fundingInfo.totalLongSizes);
    const totalShorts = BigInt(fundingInfo.totalShortSizes);

    if (totalLongs === 0n && totalShorts === 0n) {
      return { fundingFormatted: '0.0000%', fundingVariant: 'default' as const };
    }

    const rateNumerator = FUNDING_RATE_FACTOR * SECONDS_PER_HOUR * 100n * 100000n;
    const baseRatePercent = Number(rateNumerator / FUNDING_RATE_FACTOR_BASE) / 100000;

    let direction: 'positive' | 'negative' | 'neutral';
    if (totalLongs > totalShorts) direction = 'negative';
    else if (totalShorts > totalLongs) direction = 'positive';
    else direction = 'neutral';

    if (direction === 'neutral') {
      return { fundingFormatted: '0.0000%', fundingVariant: 'default' as const };
    }

    const sign = direction === 'positive' ? '+' : '-';
    const directionLabel = direction === 'negative' ? ' (L pay)' : ' (S pay)';
    const fundingFormatted = `${sign}${baseRatePercent.toFixed(4)}%${directionLabel}`;
    const fundingVariant = direction === 'positive' ? ('positive' as const) : ('negative' as const);

    return { fundingFormatted, fundingVariant };
  }, [fundingInfo, fetchStatus]);
}

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

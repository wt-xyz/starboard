import type { FC } from 'react';
import {
  $decimalValue,
  DecimalCalculator,
  DecimalValue,
  type DecimalValueInstance,
  createDecimalValueSchema,
} from 'fuel-ts-sdk';
import type { FundingInfoEntity } from 'fuel-ts-sdk/trading';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';
import { MarketStat } from '@/layouts/DashboardLayout/src/views/DashboardLayout/components/DashboardHeader/components/MarketStats/_MarketStatsBase';

export const FundingRateStat: FC = () => {
  const fundingInfo = useSdkQuery((sdk) => sdk.trading.getWatchedAssetFundingInfo());

  if (!fundingInfo) return <MarketStat label="1H Funding" value="--%" variant="default" />;

  const { formattedRate, variant } = formatHourlyFundingRate(fundingInfo);

  return <MarketStat label="1H Funding" value={formattedRate} variant={variant} />;
};

type FundingRateResult = { formattedRate: string; variant: 'default' | 'positive' | 'negative' };

function formatHourlyFundingRate(fundingInfo: FundingInfoEntity): FundingRateResult {
  const totalLongs = $decimalValue(fundingInfo.totalLongSizes).toBigInt();
  const totalShorts = $decimalValue(fundingInfo.totalShortSizes).toBigInt();

  if (totalShorts < totalLongs) return formatLongDominantRate(fundingInfo);
  if (totalShorts > totalLongs) return formatShortDominantRate(fundingInfo);

  return { formattedRate: '0.0000%', variant: 'default' };
}

function formatLongDominantRate(fundingInfo: FundingInfoEntity): FundingRateResult {
  const sizeDelta = DecimalCalculator.value(fundingInfo.totalLongSizes)
    .subtractBy(fundingInfo.totalShortSizes)
    .calculate();

  const rate = hourlyRatePercent(sizeDelta, fundingInfo.totalLongSizes);

  return { formattedRate: `-${rate.toFixed(4)}% (L pay)`, variant: 'negative' };
}

function formatShortDominantRate(fundingInfo: FundingInfoEntity): FundingRateResult {
  const sizeDelta = DecimalCalculator.value(fundingInfo.totalShortSizes)
    .subtractBy(fundingInfo.totalLongSizes)
    .calculate();

  const rate = hourlyRatePercent(sizeDelta, fundingInfo.totalShortSizes);

  return { formattedRate: `+${rate.toFixed(4)}% (S pay)`, variant: 'positive' };
}

function hourlyRatePercent(sizeDelta: DecimalValueInstance, dominantSide: DecimalValueInstance) {
  const result = DecimalCalculator.value(sizeDelta)
    .multiplyBy(FUNDING_RATE_FACTOR)
    .multiplyBy(SECONDS_PER_HOUR)
    .multiplyBy(PERCENT)
    .divideBy(dominantSide)
    .calculate(DecimalValue);

  return $decimalValue(result).toFloat();
}

const Scalar = createDecimalValueSchema(0, 'Scalar');

const FUNDING_RATE_FACTOR = DecimalValue.fromBigInt(23n);
const SECONDS_PER_HOUR = Scalar.fromBigInt(3600n);
const PERCENT = Scalar.fromBigInt(100n);

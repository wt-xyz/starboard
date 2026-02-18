import type { FC } from 'react';
import {
  $decimalValue,
  DecimalCalculator,
  DecimalValue,
  createDecimalValueSchema,
} from 'fuel-ts-sdk';
import type { FundingInfoEntity } from 'fuel-ts-sdk/trading';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';
import { MarketStat } from './_MarketStatsBase';

export const FundingRateStat: FC = () => {
  const fundingInfo = useSdkQuery((sdk) => sdk.trading.getWatchedAssetFundingInfo());

  if (!fundingInfo) return <MarketStat label="1H Funding" value="--%" variant="default" />;

  const { formattedRate, variant } = formatHourlyFundingRate(fundingInfo);

  return <MarketStat label="1H Funding" value={formattedRate} variant={variant} />;
};

function formatHourlyFundingRate(fundingInfo: FundingInfoEntity): {
  formattedRate: string;
  variant: 'default' | 'positive' | 'negative';
} {
  const totalLongs = $decimalValue(fundingInfo.totalLongSizes).toBigInt();
  const totalShorts = $decimalValue(fundingInfo.totalShortSizes).toBigInt();

  if (totalLongs === 0n && totalShorts === 0n) {
    return { formattedRate: '0.0000%', variant: 'default' };
  }

  const hourlyRatePercent = DecimalCalculator.value(FUNDING_RATE_FACTOR)
    .multiplyBy(SECONDS_PER_HOUR)
    .multiplyBy(PERCENT)
    .calculate(DecimalValue);

  const rate = $decimalValue(hourlyRatePercent).toFloat();

  if (totalLongs > totalShorts) {
    return { formattedRate: `-${rate.toFixed(4)}%`, variant: 'negative' };
  }

  if (totalShorts > totalLongs) {
    return { formattedRate: `+${rate.toFixed(4)}%`, variant: 'positive' };
  }

  return { formattedRate: '0.0000%', variant: 'default' };
}

const Scalar = createDecimalValueSchema(0, 'Scalar');

const FUNDING_RATE_FACTOR = DecimalValue.fromBigInt(23n);
const SECONDS_PER_HOUR = Scalar.fromBigInt(3600n);
const PERCENT = Scalar.fromBigInt(100n);

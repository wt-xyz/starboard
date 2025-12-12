import BigNumber from 'bignumber.js';
import { OrderSide } from 'starboard-client-js';

import { FundingDirection } from '@/constants/charts';
import { IndexerHistoricalFundingResponseObject } from '@/types/indexer/indexerApiGen';

import { MaybeBigNumber, MustBigNumber, type BigNumberish } from '@/lib/numbers';

export const getDirectionFromFundingRate = (fundingRate: string) => {
  const fundingRateBN = MustBigNumber(fundingRate);

  return fundingRateBN.isZero()
    ? FundingDirection.None
    : fundingRateBN.isPositive()
      ? FundingDirection.ToShort
      : FundingDirection.ToLong;
};

export type HistoricalFundingObject = {
  fundingRate: number;
  time: number;
  direction: FundingDirection;
};
export const mapFundingChartObject = (
  funding: IndexerHistoricalFundingResponseObject
): HistoricalFundingObject => ({
  fundingRate: MustBigNumber(funding.rate).toNumber(),
  time: new Date(funding.effectiveAt).getTime(),
  direction: getDirectionFromFundingRate(funding.rate),
});

const FUNDING_DECIMALS = 6;
const HOURS_PER_FUNDING_INTERVAL = 8;

const roundFundingValue = (value: BigNumber) =>
  value.decimalPlaces(FUNDING_DECIMALS, BigNumber.ROUND_HALF_UP);

const getValidNumber = (value?: BigNumberish | null): BigNumber | null => {
  const parsed = MaybeBigNumber(value);
  return parsed?.isFinite() ? parsed : null;
};

export type PositionFundingDirection = 'pay' | 'receive' | 'flat';

export const getPositionFundingDirection = (
  side: OrderSide | null | undefined,
  fundingRate: BigNumberish | null | undefined
): PositionFundingDirection => {
  const rate = getValidNumber(fundingRate);
  if (!side || !rate || rate.isZero()) {
    return 'flat';
  }

  const isRatePositive = rate.isPositive();
  const isLong = side === OrderSide.BUY;

  if (isRatePositive) {
    return isLong ? 'pay' : 'receive';
  }

  return isLong ? 'receive' : 'pay';
};

export const calculateFundingPayment = (
  positionSize: BigNumberish | null | undefined,
  fundingRate: BigNumberish | null | undefined,
  hoursHeld: BigNumberish | null | undefined
): BigNumber | null => {
  const size = getValidNumber(positionSize);
  const rate = getValidNumber(fundingRate);
  const hours = getValidNumber(hoursHeld);

  if (!size || !rate || !hours) {
    return null;
  }

  const payment = size.times(rate).times(hours.div(HOURS_PER_FUNDING_INTERVAL));

  if (!payment.isFinite()) {
    return null;
  }

  return roundFundingValue(payment);
};

export type FundingProjections = {
  oneDay: BigNumber | null;
  sevenDays: BigNumber | null;
  thirtyDays: BigNumber | null;
};

const projectionHours = {
  oneDay: 24,
  sevenDays: 24 * 7,
  thirtyDays: 24 * 30,
} as const;

export const calculateFundingProjections = (
  positionSize: BigNumberish | null | undefined,
  fundingRate: BigNumberish | null | undefined
): FundingProjections => ({
  oneDay: calculateFundingPayment(positionSize, fundingRate, projectionHours.oneDay),
  sevenDays: calculateFundingPayment(positionSize, fundingRate, projectionHours.sevenDays),
  thirtyDays: calculateFundingPayment(positionSize, fundingRate, projectionHours.thirtyDays),
});

export const calculateBreakEvenWithFunding = (
  entryPrice: BigNumberish | null | undefined,
  positionSize: BigNumberish | null | undefined,
  fundingRate: BigNumberish | null | undefined,
  hoursHeld: BigNumberish | null | undefined
): BigNumber | null => {
  const price = getValidNumber(entryPrice);
  const size = getValidNumber(positionSize);

  if (!price || !size) {
    return null;
  }

  const fundingPayment = calculateFundingPayment(positionSize, fundingRate, hoursHeld);

  if (fundingPayment == null) {
    return null;
  }

  if (size.isZero()) {
    return null;
  }

  const breakEvenPrice = price.plus(fundingPayment.div(size));

  return roundFundingValue(breakEvenPrice);
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getTimestampNDaysAgo = (days: number | null | undefined): number | null => {
  if (days == null || Number.isNaN(days) || days < 0) {
    return null;
  }

  return Date.now() - days * MS_PER_DAY;
};

export const getDateNDaysAgoISO = (days: number | null | undefined): string | null => {
  const timestamp = getTimestampNDaysAgo(days);
  if (timestamp == null) {
    return null;
  }

  return new Date(timestamp).toISOString();
};

export const filterHistoricalFundingByDays = (
  data: HistoricalFundingObject[] | null | undefined,
  days: number | null | undefined
): HistoricalFundingObject[] => {
  if (!data) {
    return [];
  }

  const cutoff = getTimestampNDaysAgo(days);
  if (cutoff == null) {
    return data;
  }

  return data.filter(({ time }) => time >= cutoff);
};

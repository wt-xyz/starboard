import BigNumber from 'bignumber.js';
import { groupBy, orderBy, sumBy } from 'lodash';

import {
  IndexerFundingPaymentResponseObject,
  IndexerPositionSide,
} from '@/types/indexer/indexerApiGen';

import { BIG_NUMBERS, MustBigNumber } from '@/lib/numbers';

export type TimePeriod = '1h' | '8h' | '1d' | '7d' | '30d' | '90d' | 'all';

export interface FundingPaymentProcessed {
  createdAt: Date;
  timestamp: number;
  ticker: string;
  market: string;
  side: IndexerPositionSide;
  payment: BigNumber;
  rate: BigNumber;
  size: BigNumber;
  oraclePrice: BigNumber;
}

export interface AggregatedFundingData {
  period: TimePeriod;
  startDate: Date;
  endDate: Date;
  totalPaid: BigNumber;
  totalReceived: BigNumber;
  netFunding: BigNumber;
  paymentCount: number;
  averageRate: BigNumber;
  markets: string[];
}

export interface MarketFundingAggregate {
  market: string;
  totalPaid: BigNumber;
  totalReceived: BigNumber;
  netFunding: BigNumber;
  paymentCount: number;
  averageRate: BigNumber;
  averageSize: BigNumber;
}

export interface FundingTimeSeries {
  timestamp: number;
  date: Date;
  cumulativeNet: BigNumber;
  payment: BigNumber;
  rate: BigNumber;
}

export interface FundingStats {
  total: AggregatedFundingData;
  byMarket: Map<string, MarketFundingAggregate>;
  timeSeries: FundingTimeSeries[];
  periodAggregates: Map<TimePeriod, AggregatedFundingData>;
}

export function processFundingPayment(
  payment: IndexerFundingPaymentResponseObject
): FundingPaymentProcessed {
  const createdAt = new Date(payment.createdAt);

  return {
    createdAt,
    timestamp: createdAt.getTime(),
    ticker: payment.ticker,
    market: payment.perpetualId,
    side: payment.side as IndexerPositionSide,
    payment: MustBigNumber(payment.payment),
    rate: MustBigNumber(payment.rate),
    size: MustBigNumber(payment.size),
    oraclePrice: MustBigNumber(payment.oraclePrice),
  };
}

export function aggregateFundingByPeriod(
  payments: FundingPaymentProcessed[],
  startDate: Date,
  endDate: Date,
  period: TimePeriod
): AggregatedFundingData {
  const paymentsInPeriod = payments.filter(
    (p) => p.timestamp >= startDate.getTime() && p.timestamp <= endDate.getTime()
  );

  const totalPaid = paymentsInPeriod
    .filter((p) => p.payment.isNegative())
    .reduce((sum, p) => sum.plus(p.payment.abs()), BIG_NUMBERS.ZERO);

  const totalReceived = paymentsInPeriod
    .filter((p) => p.payment.isPositive())
    .reduce((sum, p) => sum.plus(p.payment), BIG_NUMBERS.ZERO);

  const netFunding = paymentsInPeriod.reduce((sum, p) => sum.plus(p.payment), BIG_NUMBERS.ZERO);

  const averageRate =
    paymentsInPeriod.length > 0
      ? paymentsInPeriod
          .reduce((sum, p) => sum.plus(p.rate), BIG_NUMBERS.ZERO)
          .div(paymentsInPeriod.length)
      : BIG_NUMBERS.ZERO;

  const markets = Array.from(new Set(paymentsInPeriod.map((p) => p.market)));

  return {
    period,
    startDate,
    endDate,
    totalPaid,
    totalReceived,
    netFunding,
    paymentCount: paymentsInPeriod.length,
    averageRate,
    markets,
  };
}

export function aggregateFundingByMarket(
  payments: FundingPaymentProcessed[]
): Map<string, MarketFundingAggregate> {
  const grouped = groupBy(payments, (p) => p.market);
  const result = new Map<string, MarketFundingAggregate>();

  Object.entries(grouped).forEach(([market, marketPayments]) => {
    const totalPaid = marketPayments
      .filter((p) => p.payment.isNegative())
      .reduce((sum, p) => sum.plus(p.payment.abs()), BIG_NUMBERS.ZERO);

    const totalReceived = marketPayments
      .filter((p) => p.payment.isPositive())
      .reduce((sum, p) => sum.plus(p.payment), BIG_NUMBERS.ZERO);

    const netFunding = marketPayments.reduce((sum, p) => sum.plus(p.payment), BIG_NUMBERS.ZERO);

    const averageRate =
      marketPayments.length > 0
        ? marketPayments
            .reduce((sum, p) => sum.plus(p.rate), BIG_NUMBERS.ZERO)
            .div(marketPayments.length)
        : BIG_NUMBERS.ZERO;

    const averageSize =
      marketPayments.length > 0
        ? marketPayments
            .reduce((sum, p) => sum.plus(p.size), BIG_NUMBERS.ZERO)
            .div(marketPayments.length)
        : BIG_NUMBERS.ZERO;

    result.set(market, {
      market,
      totalPaid,
      totalReceived,
      netFunding,
      paymentCount: marketPayments.length,
      averageRate,
      averageSize,
    });
  });

  return result;
}

export function createFundingTimeSeries(payments: FundingPaymentProcessed[]): FundingTimeSeries[] {
  const sorted = orderBy(payments, ['timestamp'], ['asc']);

  let cumulativeNet = BIG_NUMBERS.ZERO;

  return sorted.map((payment) => {
    cumulativeNet = cumulativeNet.plus(payment.payment);

    return {
      timestamp: payment.timestamp,
      date: payment.createdAt,
      cumulativeNet,
      payment: payment.payment,
      rate: payment.rate,
    };
  });
}

export function getTimePeriodRange(
  period: TimePeriod,
  referenceDate: Date = new Date()
): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = referenceDate;
  let startDate: Date;

  switch (period) {
    case '1h':
      startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
      break;
    case '8h':
      startDate = new Date(endDate.getTime() - 8 * 60 * 60 * 1000);
      break;
    case '1d':
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      startDate = new Date(0);
      break;
  }

  return { startDate, endDate };
}

export function calculateFundingStats(
  rawPayments: IndexerFundingPaymentResponseObject[]
): FundingStats {
  const processed = rawPayments.map(processFundingPayment);
  const now = new Date();

  const periods: TimePeriod[] = ['1h', '8h', '1d', '7d', '30d', '90d', 'all'];
  const periodAggregates = new Map<TimePeriod, AggregatedFundingData>();

  periods.forEach((period) => {
    const { startDate, endDate } = getTimePeriodRange(period, now);
    const aggregate = aggregateFundingByPeriod(processed, startDate, endDate, period);
    periodAggregates.set(period, aggregate);
  });

  const total = periodAggregates.get('all')!;
  const byMarket = aggregateFundingByMarket(processed);
  const timeSeries = createFundingTimeSeries(processed);

  return {
    total,
    byMarket,
    timeSeries,
    periodAggregates,
  };
}

export function filterPaymentsByMarket(
  payments: FundingPaymentProcessed[],
  marketId: string
): FundingPaymentProcessed[] {
  return payments.filter((p) => p.market === marketId);
}

export function filterPaymentsByDateRange(
  payments: FundingPaymentProcessed[],
  startDate: Date,
  endDate: Date
): FundingPaymentProcessed[] {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  return payments.filter((p) => p.timestamp >= startTime && p.timestamp <= endTime);
}

export function calculateRollingAverage(
  payments: FundingPaymentProcessed[],
  windowSize: number
): { timestamp: number; averageRate: BigNumber; averagePayment: BigNumber }[] {
  const sorted = orderBy(payments, ['timestamp'], ['asc']);
  const results: { timestamp: number; averageRate: BigNumber; averagePayment: BigNumber }[] = [];

  for (let i = windowSize - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - windowSize + 1, i + 1);

    const averageRate = window
      .reduce((sum, p) => sum.plus(p.rate), BIG_NUMBERS.ZERO)
      .div(window.length);

    const averagePayment = window
      .reduce((sum, p) => sum.plus(p.payment), BIG_NUMBERS.ZERO)
      .div(window.length);

    results.push({
      timestamp: sorted[i].timestamp,
      averageRate,
      averagePayment,
    });
  }

  return results;
}

export function findLargestPayments(
  payments: FundingPaymentProcessed[],
  count: number = 10
): FundingPaymentProcessed[] {
  return orderBy(payments, [(p) => p.payment.abs().toNumber()], ['desc']).slice(0, count);
}

export function calculatePaymentDistribution(payments: FundingPaymentProcessed[]): {
  paid: { count: number; total: BigNumber; average: BigNumber };
  received: { count: number; total: BigNumber; average: BigNumber };
} {
  const paidPayments = payments.filter((p) => p.payment.isNegative());
  const receivedPayments = payments.filter((p) => p.payment.isPositive());

  const paidTotal = paidPayments.reduce((sum, p) => sum.plus(p.payment.abs()), BIG_NUMBERS.ZERO);
  const receivedTotal = receivedPayments.reduce((sum, p) => sum.plus(p.payment), BIG_NUMBERS.ZERO);

  return {
    paid: {
      count: paidPayments.length,
      total: paidTotal,
      average: paidPayments.length > 0 ? paidTotal.div(paidPayments.length) : BIG_NUMBERS.ZERO,
    },
    received: {
      count: receivedPayments.length,
      total: receivedTotal,
      average:
        receivedPayments.length > 0 ? receivedTotal.div(receivedPayments.length) : BIG_NUMBERS.ZERO,
    },
  };
}

export function getFundingRateStats(payments: FundingPaymentProcessed[]): {
  min: BigNumber;
  max: BigNumber;
  average: BigNumber;
  median: BigNumber;
  stdDev: BigNumber;
} {
  if (payments.length === 0) {
    return {
      min: BIG_NUMBERS.ZERO,
      max: BIG_NUMBERS.ZERO,
      average: BIG_NUMBERS.ZERO,
      median: BIG_NUMBERS.ZERO,
      stdDev: BIG_NUMBERS.ZERO,
    };
  }

  const rates = payments.map((p) => p.rate);
  const sortedRates = orderBy(rates, [(r) => r.toNumber()], ['asc']);

  const min = sortedRates[0];
  const max = sortedRates[sortedRates.length - 1];

  const average = rates.reduce((sum, r) => sum.plus(r), BIG_NUMBERS.ZERO).div(rates.length);

  const medianIndex = Math.floor(sortedRates.length / 2);
  const median =
    sortedRates.length % 2 === 0
      ? sortedRates[medianIndex - 1].plus(sortedRates[medianIndex]).div(2)
      : sortedRates[medianIndex];

  const variance = rates
    .reduce((sum, r) => sum.plus(r.minus(average).pow(2)), BIG_NUMBERS.ZERO)
    .div(rates.length);

  const stdDev = variance.sqrt();

  return { min, max, average, median, stdDev };
}

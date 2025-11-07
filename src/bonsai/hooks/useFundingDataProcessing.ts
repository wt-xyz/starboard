import { useMemo } from 'react';

import { useAppSelector } from '@/state/appTypes';

import {
    AggregatedFundingData,
    calculateFundingStats,
    calculatePaymentDistribution,
    calculateRollingAverage,
    filterPaymentsByDateRange,
    filterPaymentsByMarket,
    findLargestPayments,
    FundingPaymentProcessed,
    FundingStats,
    getFundingRateStats,
    getTimePeriodRange,
    MarketFundingAggregate,
    processFundingPayment,
    TimePeriod,
} from '../calculators/fundingDataProcessing';
import { BonsaiCore } from '../ontology';
import { useFundingPayments } from '../rest/fundingPayments';

export function useProcessedFundingPayments(): FundingPaymentProcessed[] {
  const { data: rawPayments } = useFundingPayments();

  return useMemo(() => {
    if (!rawPayments) return [];
    return rawPayments.map(processFundingPayment);
  }, [rawPayments]);
}

export function useFundingStats(): FundingStats | undefined {
  const { data: rawPayments } = useFundingPayments();

  return useMemo(() => {
    if (!rawPayments || rawPayments.length === 0) return undefined;
    return calculateFundingStats(rawPayments);
  }, [rawPayments]);
}

export function useFundingByPeriod(period: TimePeriod): AggregatedFundingData | undefined {
  const stats = useFundingStats();

  return useMemo(() => {
    if (!stats) return undefined;
    return stats.periodAggregates.get(period);
  }, [stats, period]);
}

export function useFundingByMarket(marketId?: string): MarketFundingAggregate | undefined {
  const stats = useFundingStats();

  return useMemo(() => {
    if (!stats || !marketId) return undefined;
    return stats.byMarket.get(marketId);
  }, [stats, marketId]);
}

export function useAllMarketsFundingAggregates(): Map<string, MarketFundingAggregate> | undefined {
  const stats = useFundingStats();

  return useMemo(() => {
    if (!stats) return undefined;
    return stats.byMarket;
  }, [stats]);
}

export function useCurrentMarketFundingAggregate(): MarketFundingAggregate | undefined {
  const currentMarketId = useAppSelector(BonsaiCore.markets.currentMarketId);
  return useFundingByMarket(currentMarketId);
}

export function useFundingTimeSeries() {
  const stats = useFundingStats();

  return useMemo(() => {
    if (!stats) return [];
    return stats.timeSeries;
  }, [stats]);
}

export function useFundingPaymentsByDateRange(startDate: Date, endDate: Date): FundingPaymentProcessed[] {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    return filterPaymentsByDateRange(processed, startDate, endDate);
  }, [processed, startDate, endDate]);
}

export function useFundingPaymentsByMarket(marketId: string): FundingPaymentProcessed[] {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    return filterPaymentsByMarket(processed, marketId);
  }, [processed, marketId]);
}

export function useRollingAverageFunding(windowSize: number = 10) {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    if (processed.length < windowSize) return [];
    return calculateRollingAverage(processed, windowSize);
  }, [processed, windowSize]);
}

export function useLargestFundingPayments(count: number = 10): FundingPaymentProcessed[] {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    return findLargestPayments(processed, count);
  }, [processed, count]);
}

export function useFundingPaymentDistribution() {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    return calculatePaymentDistribution(processed);
  }, [processed]);
}

export function useFundingRateStatistics() {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    return getFundingRateStats(processed);
  }, [processed]);
}

export function useFundingPeriodComparison(period1: TimePeriod, period2: TimePeriod) {
  const stats = useFundingStats();

  return useMemo(() => {
    if (!stats) return undefined;

    const data1 = stats.periodAggregates.get(period1);
    const data2 = stats.periodAggregates.get(period2);

    if (!data1 || !data2) return undefined;

    return {
      period1: {
        period: period1,
        data: data1,
      },
      period2: {
        period: period2,
        data: data2,
      },
      comparison: {
        netFundingDiff: data1.netFunding.minus(data2.netFunding),
        totalPaidDiff: data1.totalPaid.minus(data2.totalPaid),
        totalReceivedDiff: data1.totalReceived.minus(data2.totalReceived),
        averageRateDiff: data1.averageRate.minus(data2.averageRate),
        paymentCountDiff: data1.paymentCount - data2.paymentCount,
      },
    };
  }, [stats, period1, period2]);
}

export function useFundingDataForPeriod(period: TimePeriod) {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    const { startDate, endDate } = getTimePeriodRange(period);
    return filterPaymentsByDateRange(processed, startDate, endDate);
  }, [processed, period]);
}

export function useMarketFundingHistory(marketId: string, period: TimePeriod) {
  const processed = useProcessedFundingPayments();

  return useMemo(() => {
    const { startDate, endDate } = getTimePeriodRange(period);
    const filteredByMarket = filterPaymentsByMarket(processed, marketId);
    return filterPaymentsByDateRange(filteredByMarket, startDate, endDate);
  }, [processed, marketId, period]);
}

export function useTotalFundingPaidReceived() {
  const stats = useFundingStats();

  return useMemo(() => {
    if (!stats) {
      return {
        totalPaid: 0,
        totalReceived: 0,
        netFunding: 0,
      };
    }

    return {
      totalPaid: stats.total.totalPaid.toNumber(),
      totalReceived: stats.total.totalReceived.toNumber(),
      netFunding: stats.total.netFunding.toNumber(),
    };
  }, [stats]);
}

export function useMarketsWithMostFunding(count: number = 5) {
  const aggregates = useAllMarketsFundingAggregates();

  return useMemo(() => {
    if (!aggregates) return [];

    return Array.from(aggregates.values())
      .sort((a, b) => b.netFunding.abs().toNumber() - a.netFunding.abs().toNumber())
      .slice(0, count);
  }, [aggregates, count]);
}


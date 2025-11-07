import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { IndexerFundingPaymentResponseObject, IndexerPositionSide } from '@/types/indexer/indexerApiGen';

import { BIG_NUMBERS } from '@/lib/numbers';

import {
  aggregateFundingByMarket,
  aggregateFundingByPeriod,
  calculateFundingStats,
  calculatePaymentDistribution,
  calculateRollingAverage,
  createFundingTimeSeries,
  filterPaymentsByDateRange,
  filterPaymentsByMarket,
  findLargestPayments,
  getFundingRateStats,
  getTimePeriodRange,
  processFundingPayment,
} from '../fundingDataProcessing';

const createMockPayment = (
  ticker: string,
  payment: string,
  rate: string,
  createdAt: string,
  side: IndexerPositionSide = IndexerPositionSide.LONG
): IndexerFundingPaymentResponseObject => ({
  createdAt,
  createdAtHeight: '1000',
  perpetualId: `${ticker}-USD`,
  ticker,
  oraclePrice: '50000',
  size: '1',
  side,
  rate,
  payment,
  subaccountNumber: '0',
});

describe('fundingDataProcessing - Core Functions', () => {
  describe('processFundingPayment', () => {
    it('should process raw payment correctly', () => {
      const raw = createMockPayment('BTC', '-100', '0.0001', '2024-01-01T00:00:00.000Z');
      const processed = processFundingPayment(raw);

      expect(processed.ticker).toBe('BTC');
      expect(processed.market).toBe('BTC-USD');
      expect(processed.payment.toNumber()).toBe(-100);
      expect(processed.rate.toNumber()).toBe(0.0001);
      expect(processed.side).toBe(IndexerPositionSide.LONG);
      expect(processed.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(processed.timestamp).toBe(new Date('2024-01-01T00:00:00.000Z').getTime());
    });

    it('should handle positive payments', () => {
      const raw = createMockPayment('ETH', '50', '-0.0001', '2024-01-01T00:00:00.000Z', IndexerPositionSide.SHORT);
      const processed = processFundingPayment(raw);

      expect(processed.payment.toNumber()).toBe(50);
      expect(processed.rate.toNumber()).toBe(-0.0001);
      expect(processed.side).toBe(IndexerPositionSide.SHORT);
    });
  });

  describe('getTimePeriodRange', () => {
    it('should calculate 1 hour period correctly', () => {
      const ref = new Date('2024-01-01T12:00:00.000Z');
      const { startDate, endDate } = getTimePeriodRange('1h', ref);

      expect(endDate).toEqual(ref);
      expect(startDate.toISOString()).toBe('2024-01-01T11:00:00.000Z');
    });

    it('should calculate 8 hour period correctly', () => {
      const ref = new Date('2024-01-01T12:00:00.000Z');
      const { startDate, endDate } = getTimePeriodRange('8h', ref);

      expect(endDate).toEqual(ref);
      expect(startDate.toISOString()).toBe('2024-01-01T04:00:00.000Z');
    });

    it('should calculate 1 day period correctly', () => {
      const ref = new Date('2024-01-02T00:00:00.000Z');
      const { startDate, endDate } = getTimePeriodRange('1d', ref);

      expect(endDate).toEqual(ref);
      expect(startDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should calculate 7 day period correctly', () => {
      const ref = new Date('2024-01-08T00:00:00.000Z');
      const { startDate, endDate } = getTimePeriodRange('7d', ref);

      expect(endDate).toEqual(ref);
      expect(startDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should calculate 30 day period correctly', () => {
      const ref = new Date('2024-01-31T00:00:00.000Z');
      const { startDate, endDate } = getTimePeriodRange('30d', ref);

      expect(endDate).toEqual(ref);
      expect(startDate.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle all period', () => {
      const ref = new Date('2024-01-01T00:00:00.000Z');
      const { startDate, endDate } = getTimePeriodRange('all', ref);

      expect(endDate).toEqual(ref);
      expect(startDate.getTime()).toBe(0);
    });
  });
});

describe('fundingDataProcessing - Aggregation', () => {
  describe('aggregateFundingByPeriod', () => {
    it('should aggregate payments correctly', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0001', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '-0.0001', '2024-01-01T14:00:00.000Z', IndexerPositionSide.SHORT)),
      ];

      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-02T00:00:00.000Z');

      const result = aggregateFundingByPeriod(payments, startDate, endDate, '1d');

      expect(result.period).toBe('1d');
      expect(result.totalPaid.toNumber()).toBe(150);
      expect(result.totalReceived.toNumber()).toBe(75);
      expect(result.netFunding.toNumber()).toBe(-75);
      expect(result.paymentCount).toBe(3);
      expect(result.markets).toHaveLength(2);
      expect(result.markets).toContain('BTC-USD');
      expect(result.markets).toContain('ETH-USD');
    });

    it('should calculate average rate correctly', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0002', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0003', '2024-01-01T14:00:00.000Z')),
      ];

      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-02T00:00:00.000Z');

      const result = aggregateFundingByPeriod(payments, startDate, endDate, '1d');

      expect(result.averageRate.toNumber()).toBeCloseTo(0.0002, 6);
    });

    it('should filter payments by date range', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0001', '2024-01-05T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '-0.0001', '2024-01-10T14:00:00.000Z')),
      ];

      const startDate = new Date('2024-01-02T00:00:00.000Z');
      const endDate = new Date('2024-01-06T00:00:00.000Z');

      const result = aggregateFundingByPeriod(payments, startDate, endDate, '7d');

      expect(result.paymentCount).toBe(1);
      expect(result.totalPaid.toNumber()).toBe(50);
    });
  });

  describe('aggregateFundingByMarket', () => {
    it('should group payments by market', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0002', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0003', '2024-01-01T14:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '-25', '0.0001', '2024-01-01T15:00:00.000Z')),
      ];

      const result = aggregateFundingByMarket(payments);

      expect(result.size).toBe(2);
      
      const btcAggregate = result.get('BTC-USD');
      expect(btcAggregate).toBeDefined();
      expect(btcAggregate!.totalPaid.toNumber()).toBe(150);
      expect(btcAggregate!.totalReceived.toNumber()).toBe(0);
      expect(btcAggregate!.netFunding.toNumber()).toBe(-150);
      expect(btcAggregate!.paymentCount).toBe(2);

      const ethAggregate = result.get('ETH-USD');
      expect(ethAggregate).toBeDefined();
      expect(ethAggregate!.totalPaid.toNumber()).toBe(25);
      expect(ethAggregate!.totalReceived.toNumber()).toBe(75);
      expect(ethAggregate!.netFunding.toNumber()).toBe(50);
      expect(ethAggregate!.paymentCount).toBe(2);
    });

    it('should calculate average rate per market', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0003', '2024-01-01T13:00:00.000Z')),
      ];

      const result = aggregateFundingByMarket(payments);
      const btcAggregate = result.get('BTC-USD');

      expect(btcAggregate!.averageRate.toNumber()).toBeCloseTo(0.0002, 6);
    });
  });

  describe('createFundingTimeSeries', () => {
    it('should create time series with cumulative values', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0001', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0001', '2024-01-01T14:00:00.000Z')),
      ];

      const result = createFundingTimeSeries(payments);

      expect(result).toHaveLength(3);
      expect(result[0].cumulativeNet.toNumber()).toBe(-100);
      expect(result[0].payment.toNumber()).toBe(-100);
      
      expect(result[1].cumulativeNet.toNumber()).toBe(-150);
      expect(result[1].payment.toNumber()).toBe(-50);
      
      expect(result[2].cumulativeNet.toNumber()).toBe(-75);
      expect(result[2].payment.toNumber()).toBe(75);
    });

    it('should sort payments by timestamp', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-50', '0.0001', '2024-01-01T14:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0001', '2024-01-01T13:00:00.000Z')),
      ];

      const result = createFundingTimeSeries(payments);

      expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
      expect(result[1].timestamp).toBeLessThan(result[2].timestamp);
      expect(result[0].payment.toNumber()).toBe(-100);
    });
  });
});

describe('fundingDataProcessing - Filters', () => {
  describe('filterPaymentsByMarket', () => {
    it('should filter payments by market ID', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '-50', '0.0001', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '75', '0.0001', '2024-01-01T14:00:00.000Z')),
      ];

      const result = filterPaymentsByMarket(payments, 'BTC-USD');

      expect(result).toHaveLength(2);
      expect(result[0].market).toBe('BTC-USD');
      expect(result[1].market).toBe('BTC-USD');
    });
  });

  describe('filterPaymentsByDateRange', () => {
    it('should filter payments within date range', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '-50', '0.0001', '2024-01-02T13:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '75', '0.0001', '2024-01-03T14:00:00.000Z')),
      ];

      const startDate = new Date('2024-01-02T00:00:00.000Z');
      const endDate = new Date('2024-01-03T00:00:00.000Z');

      const result = filterPaymentsByDateRange(payments, startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('ETH');
    });
  });
});

describe('fundingDataProcessing - Statistics', () => {
  describe('calculatePaymentDistribution', () => {
    it('should calculate distribution correctly', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0001', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0001', '2024-01-01T14:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '25', '0.0001', '2024-01-01T15:00:00.000Z')),
      ];

      const result = calculatePaymentDistribution(payments);

      expect(result.paid.count).toBe(2);
      expect(result.paid.total.toNumber()).toBe(150);
      expect(result.paid.average.toNumber()).toBe(75);

      expect(result.received.count).toBe(2);
      expect(result.received.total.toNumber()).toBe(100);
      expect(result.received.average.toNumber()).toBe(50);
    });
  });

  describe('getFundingRateStats', () => {
    it('should calculate rate statistics', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0003', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0002', '2024-01-01T14:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '25', '0.0004', '2024-01-01T15:00:00.000Z')),
      ];

      const result = getFundingRateStats(payments);

      expect(result.min.toNumber()).toBe(0.0001);
      expect(result.max.toNumber()).toBe(0.0004);
      expect(result.average.toNumber()).toBe(0.00025);
      expect(result.median.toNumber()).toBe(0.00025);
      expect(result.stdDev.toNumber()).toBeGreaterThan(0);
    });

    it('should handle empty array', () => {
      const result = getFundingRateStats([]);

      expect(result.min.toNumber()).toBe(0);
      expect(result.max.toNumber()).toBe(0);
      expect(result.average.toNumber()).toBe(0);
    });
  });

  describe('calculateRollingAverage', () => {
    it('should calculate rolling average correctly', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-50', '0.0002', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0003', '2024-01-01T14:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '25', '0.0004', '2024-01-01T15:00:00.000Z')),
      ];

      const result = calculateRollingAverage(payments, 2);

      expect(result).toHaveLength(3);
      expect(result[0].averageRate.toNumber()).toBeCloseTo(0.00015, 6);
      expect(result[0].averagePayment.toNumber()).toBeCloseTo(-75, 6);
      
      expect(result[1].averageRate.toNumber()).toBeCloseTo(0.00025, 6);
    });

    it('should handle window size larger than array', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
      ];

      const result = calculateRollingAverage(payments, 3);

      expect(result).toHaveLength(0);
    });
  });

  describe('findLargestPayments', () => {
    it('should find largest payments by absolute value', () => {
      const payments = [
        processFundingPayment(createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z')),
        processFundingPayment(createMockPayment('BTC', '-250', '0.0002', '2024-01-01T13:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '75', '0.0003', '2024-01-01T14:00:00.000Z')),
        processFundingPayment(createMockPayment('ETH', '300', '0.0004', '2024-01-01T15:00:00.000Z')),
      ];

      const result = findLargestPayments(payments, 2);

      expect(result).toHaveLength(2);
      expect(result[0].payment.abs().toNumber()).toBe(300);
      expect(result[1].payment.abs().toNumber()).toBe(250);
    });
  });
});

describe('fundingDataProcessing - Complete Stats', () => {
  describe('calculateFundingStats', () => {
    it('should calculate complete funding stats', () => {
      const rawPayments = [
        createMockPayment('BTC', '-100', '0.0001', '2024-01-01T12:00:00.000Z'),
        createMockPayment('BTC', '-50', '0.0002', '2024-01-01T13:00:00.000Z'),
        createMockPayment('ETH', '75', '0.0003', '2024-01-01T14:00:00.000Z'),
      ];

      const result = calculateFundingStats(rawPayments);

      expect(result.total).toBeDefined();
      expect(result.total.totalPaid.toNumber()).toBe(150);
      expect(result.total.totalReceived.toNumber()).toBe(75);
      expect(result.total.netFunding.toNumber()).toBe(-75);

      expect(result.byMarket.size).toBe(2);
      expect(result.byMarket.has('BTC-USD')).toBe(true);
      expect(result.byMarket.has('ETH-USD')).toBe(true);

      expect(result.timeSeries).toHaveLength(3);
      
      expect(result.periodAggregates.size).toBeGreaterThan(0);
      expect(result.periodAggregates.has('1d')).toBe(true);
      expect(result.periodAggregates.has('7d')).toBe(true);
      expect(result.periodAggregates.has('30d')).toBe(true);
    });
  });
});


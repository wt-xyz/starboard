import { OrderSide } from 'starboard-client-js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, it } from 'vitest';

import { FundingDirection } from '@/constants/charts';

import {
  calculateBreakEvenWithFunding,
  calculateFundingPayment,
  calculateFundingProjections,
  filterHistoricalFundingByDays,
  getDateNDaysAgoISO,
  getPositionFundingDirection,
  getTimestampNDaysAgo,
  type HistoricalFundingObject,
} from '../funding';

describe('funding calculator', () => {
  describe('calculateFundingPayment', () => {
    it('computes funding using the core formula with 6-decimal precision', () => {
      const payment = calculateFundingPayment(100, 0.001234567, 24);
      expect(payment?.toFixed(6)).toBe('0.370370');
    });

    it('handles negative funding rates', () => {
      const payment = calculateFundingPayment(50, -0.0025, 8);
      expect(payment?.toFixed(6)).toBe('-0.012500');
    });

    it('returns null for invalid or missing inputs', () => {
      expect(calculateFundingPayment(undefined, 0.001, 8)).toBeNull();
      expect(calculateFundingPayment(10, null, 8)).toBeNull();
      expect(calculateFundingPayment(10, 0.001, 'abc' as unknown as number)).toBeNull();
    });
  });

  describe('getPositionFundingDirection', () => {
    it('indicates pay or receive based on side and funding sign', () => {
      expect(getPositionFundingDirection(OrderSide.BUY, 0.001)).toBe('pay');
      expect(getPositionFundingDirection(OrderSide.BUY, -0.001)).toBe('receive');
      expect(getPositionFundingDirection(OrderSide.SELL, 0.001)).toBe('receive');
      expect(getPositionFundingDirection(OrderSide.SELL, -0.001)).toBe('pay');
    });

    it('returns flat when rate is zero or side missing', () => {
      expect(getPositionFundingDirection(undefined, 0.001)).toBe('flat');
      expect(getPositionFundingDirection(OrderSide.BUY, 0)).toBe('flat');
    });
  });

  describe('calculateFundingProjections', () => {
    it('returns projections for 1d, 7d, and 30d', () => {
      const { oneDay, sevenDays, thirtyDays } = calculateFundingProjections(10, 0.001);
      expect(oneDay?.toFixed(6)).toBe('0.030000');
      expect(sevenDays?.toFixed(6)).toBe('0.210000');
      expect(thirtyDays?.toFixed(6)).toBe('0.900000');
    });

    it('propagates null when inputs are invalid', () => {
      const result = calculateFundingProjections(null, 0.001);
      expect(result.oneDay).toBeNull();
      expect(result.sevenDays).toBeNull();
      expect(result.thirtyDays).toBeNull();
    });
  });

  describe('calculateBreakEvenWithFunding', () => {
    it('adjusts break-even price using funding payment', () => {
      const breakEven = calculateBreakEvenWithFunding(100, 2, 0.01, 8);
      // funding payment: 2 * 0.01 * (8/8) = 0.02 -> /2 = 0.01
      expect(breakEven?.toFixed(6)).toBe('100.010000');
    });

    it('returns null for invalid inputs or zero size', () => {
      expect(calculateBreakEvenWithFunding(null, 1, 0.01, 8)).toBeNull();
      expect(calculateBreakEvenWithFunding(10, 0, 0.01, 8)).toBeNull();
    });
  });

  describe('date helpers', () => {
    it('returns timestamps and ISO strings for prior days', () => {
      const days = 7;
      const timestamp = getTimestampNDaysAgo(days);
      expect(timestamp).not.toBeNull();
      if (!timestamp) return;
      const iso = getDateNDaysAgoISO(days);
      expect(iso).not.toBeNull();
      expect(new Date(iso ?? '').getTime()).toBeCloseTo(timestamp, -1);
    });

    it('handles invalid day input gracefully', () => {
      expect(getTimestampNDaysAgo(-1)).toBeNull();
      expect(getDateNDaysAgoISO(null)).toBeNull();
    });
  });

  describe('filterHistoricalFundingByDays', () => {
    it('filters entries older than the cutoff', () => {
      const now = Date.now();
      const data: HistoricalFundingObject[] = [
        {
          fundingRate: 0.01,
          time: now - 2 * 24 * 60 * 60 * 1000,
          direction: FundingDirection.ToLong,
        },
        {
          fundingRate: 0.02,
          time: now - 12 * 60 * 60 * 1000,
          direction: FundingDirection.ToShort,
        },
      ];

      const filtered = filterHistoricalFundingByDays(data, 1);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.fundingRate).toBe(0.02);
    });

    it('returns empty array for missing data', () => {
      expect(filterHistoricalFundingByDays(undefined, 1)).toEqual([]);
    });
  });
});

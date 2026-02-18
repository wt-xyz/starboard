import { render, screen } from '@testing-library/react';
import { assetId, createDecimalValueSchema } from 'fuel-ts-sdk';
import type { FundingInfoEntity } from 'fuel-ts-sdk/trading';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FundingRateStat } from '../../src/views/DashboardLayout/components/DashboardHeader/components/MarketStats/FundingRateState';

const OpenInterest = createDecimalValueSchema(6, 'OpenInterest');
const FundingRate = createDecimalValueSchema(18, 'FundingRate');

let mockFundingInfo: FundingInfoEntity | undefined;

vi.mock('@/lib/fuel-ts-sdk', () => ({
  useSdkQuery: () => mockFundingInfo,
}));

function createFundingInfo(totalLongs: number, totalShorts: number): FundingInfoEntity {
  return {
    assetId: assetId('test-asset'),
    totalLongSizes: OpenInterest.fromFloat(totalLongs),
    totalShortSizes: OpenInterest.fromFloat(totalShorts),
    longCumulativeFundingRate: FundingRate.fromBigInt(0n),
    shortCumulativeFundingRate: FundingRate.fromBigInt(0n),
  };
}

// Contract formula (vault/src/main.sw):
// rate_per_second = abs(totalLong - totalShort) * FUNDING_RATE_FACTOR / (FUNDING_RATE_FACTOR_BASE * dominantSide)
// where FUNDING_RATE_FACTOR = 23, FUNDING_RATE_FACTOR_BASE = 10^9
// hourly_percent = rate_per_second * 3600 * 100
// max hourly rate (100% imbalance) = 23 / 10^9 * 3600 * 100 = 0.00828%

describe('FundingRateStat', () => {
  beforeEach(() => {
    mockFundingInfo = undefined;
  });

  it('renders placeholder when no funding info', () => {
    render(<FundingRateStat />);

    expect(screen.getByText('--%')).toBeInTheDocument();
  });

  it('renders 0.0000% when both sides are zero', () => {
    mockFundingInfo = createFundingInfo(0, 0);
    render(<FundingRateStat />);

    expect(screen.getByText('0.0000%')).toBeInTheDocument();
  });

  it('renders 0.0000% when longs equal shorts', () => {
    mockFundingInfo = createFundingInfo(100, 100);
    render(<FundingRateStat />);

    expect(screen.getByText('0.0000%')).toBeInTheDocument();
  });

  describe('long dominant (longs pay)', () => {
    it('renders negative rate at max imbalance', () => {
      // 100% imbalance: 23/10^9 * 3600 * 100 = 0.00828 → "-0.0083%"
      mockFundingInfo = createFundingInfo(100, 0);
      render(<FundingRateStat />);

      expect(screen.getByText('-0.0083%')).toBeInTheDocument();
    });

    it('renders negative rate scaled by imbalance ratio', () => {
      // imbalance = (100-50)/100 = 0.5, rate = 0.5 * 0.00828 = 0.00414 → "-0.0041%"
      mockFundingInfo = createFundingInfo(100, 50);
      render(<FundingRateStat />);

      expect(screen.getByText('-0.0041%')).toBeInTheDocument();
    });

    it('renders small rate for near-balanced market', () => {
      // imbalance = (100-99)/100 = 0.01, rate = 0.01 * 0.00828 = 0.0000828 → "-0.0001%"
      mockFundingInfo = createFundingInfo(100, 99);
      render(<FundingRateStat />);

      expect(screen.getByText('-0.0001%')).toBeInTheDocument();
    });
  });

  describe('short dominant (shorts pay)', () => {
    it('renders positive rate at max imbalance', () => {
      mockFundingInfo = createFundingInfo(0, 100);
      render(<FundingRateStat />);

      expect(screen.getByText('+0.0083%')).toBeInTheDocument();
    });

    it('renders positive rate scaled by imbalance ratio', () => {
      // imbalance = (100-50)/100 = 0.5
      mockFundingInfo = createFundingInfo(50, 100);
      render(<FundingRateStat />);

      expect(screen.getByText('+0.0041%')).toBeInTheDocument();
    });

    it('renders small rate for near-balanced market', () => {
      mockFundingInfo = createFundingInfo(99, 100);
      render(<FundingRateStat />);

      expect(screen.getByText('+0.0001%')).toBeInTheDocument();
    });
  });
});

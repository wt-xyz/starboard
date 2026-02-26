import { render, screen } from '@testing-library/react';
import { assetId } from 'fuel-ts-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenInterestStat } from '../../src/views/DashboardLayout/components/DashboardHeader/components/MarketStats/OpenInterestStat';

const mockGetWatchedAsset = vi.fn();
const mockGetAssetOpenInterestTotal = vi.fn();
const mockGetAssetOpenInterestLongPct = vi.fn();
const mockGetAssetOpenInterestShortPct = vi.fn();

const tradingSdk = {
  getWatchedAsset: mockGetWatchedAsset,
  getAssetOpenInterestTotal: mockGetAssetOpenInterestTotal,
  getAssetOpenInterestLongPct: mockGetAssetOpenInterestLongPct,
  getAssetOpenInterestShortPct: mockGetAssetOpenInterestShortPct,
};

vi.mock('@/lib/fuel-ts-sdk', () => ({
  useTradingSdk: () => tradingSdk,
  useSdkQuery: (selector: () => unknown) => selector(),
}));

const WATCHED_ASSET = {
  assetId: assetId('btc-asset-id'),
  symbol: 'BTCUSD',
  name: 'Bitcoin',
  decimals: 9,
};

describe('OpenInterestStat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetWatchedAsset.mockReturnValue(WATCHED_ASSET);
    mockGetAssetOpenInterestTotal.mockReturnValue(null);
    mockGetAssetOpenInterestLongPct.mockReturnValue(null);
    mockGetAssetOpenInterestShortPct.mockReturnValue(null);
  });

  it('shows placeholder when total is null', () => {
    mockGetAssetOpenInterestTotal.mockReturnValue(null);

    render(<OpenInterestStat />);

    expect(screen.getByText('$--')).toBeInTheDocument();
  });

  it('shows placeholder when total is undefined', () => {
    mockGetAssetOpenInterestTotal.mockReturnValue(undefined);

    render(<OpenInterestStat />);

    expect(screen.getByText('$--')).toBeInTheDocument();
  });

  it('shows $0 when total is zero', () => {
    mockGetAssetOpenInterestTotal.mockReturnValue(0);

    render(<OpenInterestStat />);

    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('formats total without long/short when percentages are null', () => {
    mockGetAssetOpenInterestTotal.mockReturnValue(1500000);

    render(<OpenInterestStat />);

    expect(screen.getByText('$1.50M')).toBeInTheDocument();
  });

  it('formats total without long/short when percentages are undefined', () => {
    mockGetAssetOpenInterestTotal.mockReturnValue(1500000);
    mockGetAssetOpenInterestLongPct.mockReturnValue(undefined);
    mockGetAssetOpenInterestShortPct.mockReturnValue(undefined);

    render(<OpenInterestStat />);

    expect(screen.getByText('$1.50M')).toBeInTheDocument();
  });

  it('shows total with long/short split when all values present', () => {
    mockGetAssetOpenInterestTotal.mockReturnValue(1500000);
    mockGetAssetOpenInterestLongPct.mockReturnValue(0.6);
    mockGetAssetOpenInterestShortPct.mockReturnValue(0.4);

    render(<OpenInterestStat />);

    expect(screen.getByText('$1.50M (60L/40S)')).toBeInTheDocument();
  });
});

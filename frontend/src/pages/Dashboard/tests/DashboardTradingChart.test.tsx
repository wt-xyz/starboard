import { render } from '@testing-library/react';
import { assetId } from 'fuel-ts-sdk';
import type { RequestStatus } from 'fuel-ts-sdk';
import type { AssetEntity, Candle, CandleInterval } from 'fuel-ts-sdk/trading';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardTradingChart } from '../src/components/DashboardTradingChart';

const WATCHED_ASSET: AssetEntity = {
  assetId: assetId('test-asset'),
  symbol: 'BTCUSD',
  name: 'Bitcoin',
  decimals: 9,
};

const MOCK_CANDLE: Candle = {
  id: 'candle-1' as Candle['id'],
  asset: assetId('test-asset'),
  interval: 'M15',
  startedAt: 1700000000,
  openPrice: '100000000000',
  highPrice: '101000000000',
  lowPrice: '99000000000',
  closePrice: '100500000000',
};

let mockCandlesStatus: RequestStatus = 'uninitialized';
let mockCandles: Candle[] = [];
let fetchCandlesCalls: Array<{ assetId: string; interval: CandleInterval }> = [];
let getCandlesCalls: Array<{ assetId: string; interval: CandleInterval }> = [];

const mockFetchCandles = vi.fn(async (asset: string, interval: CandleInterval) => {
  fetchCandlesCalls.push({ assetId: asset, interval });
  // After fetching, candles become available
  mockCandles = [MOCK_CANDLE];
  mockCandlesStatus = 'fulfilled';
});

const mockGetCandles = vi.fn((asset: string, interval: CandleInterval) => {
  getCandlesCalls.push({ assetId: asset, interval });
  return mockCandles;
});

const mockGetCandlesStatus = vi.fn((_asset: string, _interval: CandleInterval): RequestStatus => {
  return mockCandlesStatus;
});

// Capture the candlesGetter so we can call it directly in tests
let capturedCandlesGetter: ((interval: CandleInterval) => Promise<Candle[]>) | null = null;

vi.mock('@/components/TradingChart', () => ({
  TradingChart: ({
    candlesGetter,
  }: {
    symbol: string;
    candlesGetter: (interval: CandleInterval) => Promise<Candle[]>;
  }) => {
    capturedCandlesGetter = candlesGetter;
    return <div data-testid="trading-chart" />;
  },
}));

vi.mock('@/lib/fuel-ts-sdk', () => ({
  useTradingSdk: () => ({
    getWatchedAsset: () => WATCHED_ASSET,
    getWatchedAssetLatestPrice: () => null,
    getCandlesStatus: mockGetCandlesStatus,
    fetchCandles: mockFetchCandles,
    getCandles: mockGetCandles,
  }),
  useSdkQuery: (selector: (sdk: unknown) => unknown) => {
    try {
      return selector({
        trading: {
          getWatchedAsset: () => WATCHED_ASSET,
        },
      });
    } catch {
      // Direct method refs (e.g. tradingSdk.getWatchedAssetLatestPrice) are
      // called with no args; if the selector throws, call it directly.
      return (selector as () => unknown)();
    }
  },
}));

describe('DashboardTradingChart', () => {
  beforeEach(() => {
    mockCandlesStatus = 'uninitialized';
    mockCandles = [];
    fetchCandlesCalls = [];
    getCandlesCalls = [];
    capturedCandlesGetter = null;
    vi.clearAllMocks();
  });

  it('fetches candles when status is uninitialized', async () => {
    mockCandlesStatus = 'uninitialized';

    render(<DashboardTradingChart />);
    expect(capturedCandlesGetter).not.toBeNull();

    const candles = await capturedCandlesGetter!('M15');

    expect(mockFetchCandles).toHaveBeenCalledWith(WATCHED_ASSET.assetId, 'M15');
    expect(candles).toEqual([MOCK_CANDLE]);
  });

  it('fetches candles when status is pending (StrictMode re-mount)', async () => {
    // Simulates React StrictMode: first mount starts the fetch (status becomes 'pending'),
    // then cleanup destroys the widget, second mount sees status='pending'.
    // The candlesGetter must still await the fetch, not return empty data.
    mockCandlesStatus = 'pending';
    mockCandles = []; // No data yet since fetch is in flight

    render(<DashboardTradingChart />);
    expect(capturedCandlesGetter).not.toBeNull();

    const candles = await capturedCandlesGetter!('M15');

    expect(mockFetchCandles).toHaveBeenCalledWith(WATCHED_ASSET.assetId, 'M15');
    expect(candles.length).toBeGreaterThan(0);
  });

  it('does not re-fetch when candles are already fulfilled', async () => {
    mockCandlesStatus = 'fulfilled';
    mockCandles = [MOCK_CANDLE];

    render(<DashboardTradingChart />);
    expect(capturedCandlesGetter).not.toBeNull();

    const candles = await capturedCandlesGetter!('M15');

    expect(mockFetchCandles).not.toHaveBeenCalled();
    expect(candles).toEqual([MOCK_CANDLE]);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assetId } from 'fuel-ts-sdk';
import type { AssetEntity } from 'fuel-ts-sdk/trading';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetSelect } from '../src/AssetSelect';

// Stub the Popover API which jsdom doesn't support
HTMLElement.prototype.hidePopover = vi.fn();
HTMLElement.prototype.showPopover = vi.fn();

const mockWatchAsset = vi.fn();
const mockGetAllAssets = vi.fn<() => AssetEntity[]>();
const mockGetWatchedAsset = vi.fn();
const mockGetAssetLatestPrice = vi.fn().mockReturnValue(null);
const mockGetAssetPriceChange24h = vi.fn().mockReturnValue(null);
const mockGetAssetVolume24h = vi.fn().mockReturnValue(null);
const mockGetAssetOpenInterestTotal = vi.fn().mockReturnValue(null);
const mockGetAssetOpenInterestLongPct = vi.fn().mockReturnValue(null);
const mockGetAssetOpenInterestShortPct = vi.fn().mockReturnValue(null);

const tradingSdk = {
  getAllAssets: mockGetAllAssets,
  getWatchedAsset: mockGetWatchedAsset,
  watchAsset: mockWatchAsset,
  getAssetLatestPrice: mockGetAssetLatestPrice,
  getAssetPriceChange24h: mockGetAssetPriceChange24h,
  getAssetVolume24h: mockGetAssetVolume24h,
  getAssetOpenInterestTotal: mockGetAssetOpenInterestTotal,
  getAssetOpenInterestLongPct: mockGetAssetOpenInterestLongPct,
  getAssetOpenInterestShortPct: mockGetAssetOpenInterestShortPct,
};

vi.mock('@/lib/fuel-ts-sdk', () => ({
  useTradingSdk: () => tradingSdk,
  useSdkQuery: (selector: (sdk: { trading: typeof tradingSdk }) => unknown) =>
    selector({ trading: tradingSdk }),
}));

const mockAssets: AssetEntity[] = [
  {
    assetId: assetId('btc-asset-id'),
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    decimals: 9,
  },
  {
    assetId: assetId('eth-asset-id'),
    symbol: 'ETHUSD',
    name: 'Ethereum',
    decimals: 9,
  },
  {
    assetId: assetId('usdc-asset-id'),
    symbol: 'USDC',
    name: 'USD Coin',
    isBaseAsset: true,
    decimals: 6,
  },
];

describe('AssetSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllAssets.mockReturnValue(mockAssets);
    mockGetWatchedAsset.mockReturnValue(mockAssets[0]);
    mockGetAssetLatestPrice.mockReturnValue(null);
    mockGetAssetPriceChange24h.mockReturnValue(null);
    mockGetAssetVolume24h.mockReturnValue(null);
    mockGetAssetOpenInterestTotal.mockReturnValue(null);
    mockGetAssetOpenInterestLongPct.mockReturnValue(null);
    mockGetAssetOpenInterestShortPct.mockReturnValue(null);
  });

  it('renders the formatted symbol in the trigger button', () => {
    render(<AssetSelect />);

    const trigger = screen.getByRole('button', { name: /BTC\/USD/i });
    expect(trigger).toBeInTheDocument();
  });

  it('renders asset icon in the trigger', () => {
    render(<AssetSelect />);

    const trigger = screen.getByRole('button', { name: /BTC\/USD/i });
    const icon = trigger.querySelector('img');
    expect(icon).toHaveAttribute('src', 'https://verified-assets.fuel.network/images/solvBTC.webp');
  });

  it('filters out base assets from the table', () => {
    render(<AssetSelect />);

    // Base asset (USDC) should not appear anywhere
    expect(screen.queryByText('USDC')).not.toBeInTheDocument();
    expect(screen.queryByText('USDC/USD')).not.toBeInTheDocument();
  });

  it('renders a table row for each non-base asset', () => {
    const { container } = render(<AssetSelect />);

    const bodyRows = container.querySelectorAll('tbody tr');
    // 2 asset rows (BTC, ETH — USDC filtered out)
    expect(bodyRows).toHaveLength(2);
  });

  it('calls watchAsset when an asset row is clicked', async () => {
    const user = userEvent.setup();
    render(<AssetSelect />);

    const ethText = screen.getByText('ETH/USD');
    await user.click(ethText.closest('tr')!);

    expect(mockWatchAsset).toHaveBeenCalledWith('eth-asset-id');
  });

  it('shows "Select Market" when no watched asset', () => {
    mockGetWatchedAsset.mockReturnValue(undefined);

    render(<AssetSelect />);

    expect(screen.getByText('Select Market')).toBeInTheDocument();
  });

  it('handles empty assets list', () => {
    mockGetAllAssets.mockReturnValue([]);

    const { container } = render(<AssetSelect />);

    const bodyRows = container.querySelectorAll('tbody tr');
    expect(bodyRows).toHaveLength(0);
  });

  it('shows volume fallback when volume is null', () => {
    mockGetAssetVolume24h.mockReturnValue(null);

    const { container } = render(<AssetSelect />);

    const mutedSpans = container.querySelectorAll('tbody span');
    const dashes = Array.from(mutedSpans).filter((el) => el.textContent === '--');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('shows volume fallback when volume is undefined', () => {
    mockGetAssetVolume24h.mockReturnValue(undefined);

    const { container } = render(<AssetSelect />);

    const mutedSpans = container.querySelectorAll('tbody span');
    const dashes = Array.from(mutedSpans).filter((el) => el.textContent === '--');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('star buttons have accessible labels', () => {
    const { container } = render(<AssetSelect />);

    const starButtons = container.querySelectorAll('button[aria-label="Add to watchlist"]');
    expect(starButtons).toHaveLength(2); // one per non-base asset row
  });
});

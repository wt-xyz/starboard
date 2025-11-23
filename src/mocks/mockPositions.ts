export type MockPositionCollateral = {
  marketId: string;
  ticker: string;
  marginValue: number;
};

/**
 * Lightweight fixture that developers can opt into (via VITE_ENABLE_POSITION_MOCKS=true)
 * when the mock indexer isn't returning open positions. This keeps STAR-113 UI
 * testable without depending on backend data.
 */
export const MOCK_POSITION_COLLATERAL: MockPositionCollateral[] = [
  {
    marketId: 'mock-eth-usd',
    ticker: 'ETH-USD',
    marginValue: 75000,
  },
  {
    marketId: 'mock-btc-usd',
    ticker: 'BTC-USD',
    marginValue: 42000,
  },
  {
    marketId: 'mock-fuel-usd',
    ticker: 'FUEL-USD',
    marginValue: 1800,
  },
];

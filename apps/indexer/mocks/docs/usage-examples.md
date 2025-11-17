# Mock Data Usage Examples

Code examples for consuming mock data in the frontend.

## Setup

### Configure Indexer URL

```typescript
// public/configs/v1/env.json
{
  "INDEXER_API_HOST": "http://localhost:4000",
  "INDEXER_WS_HOST": "ws://localhost:4000"
}
```

### IndexerClient Initialization

```typescript
import { IndexerClient } from '@starboard/ts-sdk';

const indexerClient = new IndexerClient({
  baseURL: 'http://localhost:4000',
  timeout: 5000,
});
```

## Story Examples

### STAR-113: View Account Balance

```typescript
// Fetch parent subaccount with aggregated data
async function getAccountBalance(address: string) {
  const response = await indexerClient.account.getParentSubaccount(
    address,
    0 // parent subaccount number
  );

  return {
    totalEquity: response.equity, // "245000.00"
    freeCollateral: response.freeCollateral, // "120000.00"
    // Calculate margin utilization
    marginUtilization: calculateMarginUtilization(
      response.equity,
      response.freeCollateral
    ),
  };
}

function calculateMarginUtilization(equity: string, free: string): number {
  const totalEquity = parseFloat(equity);
  const freeCollateral = parseFloat(free);
  const usedCollateral = totalEquity - freeCollateral;
  return (usedCollateral / totalEquity) * 100;
}

// Usage
const balance = await getAccountBalance('0x123...');
console.log(`Margin Utilization: ${balance.marginUtilization.toFixed(2)}%`);

// Color coding for UI
function getHealthColor(utilization: number): string {
  if (utilization < 50) return 'green';
  if (utilization < 80) return 'yellow';
  return 'red';
}
```

### STAR-107/108: Open Position

```typescript
// Get market data with leverage limits
async function getMarketData(ticker: string) {
  const response = await indexerClient.markets.getPerpetualMarkets(ticker);
  const market = response.markets[ticker];

  return {
    ticker: market.ticker,
    price: market.oraclePrice,
    leverage: {
      min: 2,
      max: ['ETH-USD', 'BTC-USD'].includes(ticker) ? 20 : 10,
    },
    fees: {
      maker: '0.0002', // 0.02%
      taker: '0.0005', // 0.05%
    },
    limits: {
      minSize: '10',
      maxSize: '1000000',
    },
  };
}

// Calculate liquidation price
function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  isLong: boolean,
  fee: number = 0.0005
): number {
  if (isLong) {
    return entryPrice * (1 - 1 / leverage + fee);
  } else {
    return entryPrice * (1 + 1 / leverage - fee);
  }
}

// Usage
const market = await getMarketData('ETH-USD');
const entryPrice = parseFloat(market.price);
const leverage = 10;

const liqPrice = calculateLiquidationPrice(entryPrice, leverage, true);
console.log(`Liquidation Price: $${liqPrice.toFixed(2)}`);
```

### STAR-116: View Current Positions

```typescript
// Fetch positions with P&L calculations
async function getPositions(address: string) {
  const response = await indexerClient.account.getPerpetualPositions(
    address,
    null, // all subaccounts
    'OPEN' // only open positions
  );

  return response.positions.map((position) => ({
    market: position.market,
    side: position.side,
    size: position.size,
    entryPrice: position.entryPrice,
    unrealizedPnl: position.unrealizedPnl,
    // Calculate ROE
    roe: calculateROE(
      position.unrealizedPnl,
      position.entryPrice,
      position.size
    ),
    // Funding received/paid
    netFunding: position.netFunding,
  }));
}

function calculateROE(
  unrealizedPnl: string,
  entryPrice: string,
  size: string
): number {
  const pnl = parseFloat(unrealizedPnl);
  const entry = parseFloat(entryPrice);
  const sizeNum = parseFloat(size);
  const initialMargin = entry * sizeNum;
  return (pnl / initialMargin) * 100;
}

// Usage
const positions = await getPositions('0x123...');
positions.forEach((pos) => {
  console.log(`${pos.market}: ${pos.roe.toFixed(2)}% ROE`);
});
```

### STAR-117: Close Position

```typescript
// Calculate close position details
function calculateCloseDetails(
  position: any,
  closePercentage: number, // 25, 50, 75, or 100
  currentPrice: number
) {
  const size = parseFloat(position.size);
  const entryPrice = parseFloat(position.entryPrice);
  const closeSize = size * (closePercentage / 100);

  const pnl =
    position.side === 'LONG'
      ? (currentPrice - entryPrice) * closeSize
      : (entryPrice - currentPrice) * closeSize;

  const fees = {
    trading: closeSize * currentPrice * 0.0005, // 0.05% taker fee
    funding: 0, // Would be calculated based on time held
    network: 0.5, // Estimated gas in USDC
  };

  const totalFees = Object.values(fees).reduce((a, b) => a + b, 0);

  return {
    closeSize,
    estimatedExitPrice: currentPrice,
    grossPnL: pnl,
    fees,
    netPnL: pnl - totalFees,
  };
}

// Usage
const closeDetails = calculateCloseDetails(
  position,
  50, // Close 50%
  3250 // Current ETH price
);

console.log(`Net P&L: $${closeDetails.netPnL.toFixed(2)}`);
```

### STAR-118: View Market Charts

```typescript
// Fetch candle data for charts
async function getCandleData(
  ticker: string,
  resolution: '1MIN' | '5MINS' | '1HOUR' | '1DAY',
  limit: number = 100
) {
  const response = await indexerClient.markets.getPerpetualMarketCandles(
    ticker,
    resolution,
    limit
  );

  return response.candles.map((candle) => ({
    time: new Date(candle.startedAt).getTime() / 1000, // Unix timestamp
    open: parseFloat(candle.open),
    high: parseFloat(candle.high),
    low: parseFloat(candle.low),
    close: parseFloat(candle.close),
    volume: parseFloat(candle.usdVolume),
  }));
}

// Get 24h market stats
async function get24hStats(ticker: string) {
  const response = await indexerClient.markets.getPerpetualMarkets(ticker);
  const market = response.markets[ticker];

  return {
    price: parseFloat(market.oraclePrice),
    change24h: parseFloat(market.priceChange24H),
    volume24h: parseFloat(market.volume24H),
    trades24h: market.trades24H,
    openInterest: parseFloat(market.openInterest),
  };
}

// Usage
const candles = await getCandleData('ETH-USD', '1HOUR', 24);
const stats = await get24hStats('ETH-USD');

console.log(`24h Volume: $${stats.volume24h.toLocaleString()}`);
```

### STAR-120: View Trading History

```typescript
// Fetch trading history with pagination
async function getTradingHistory(
  address: string,
  subaccountNumber: number,
  page: number = 1,
  limit: number = 25
) {
  const response = await indexerClient.account.getSubaccountFills(
    address,
    subaccountNumber,
    limit,
    page
  );

  return {
    fills: response.fills.map((fill) => ({
      id: fill.id,
      market: fill.market,
      side: fill.side,
      price: fill.price,
      size: fill.size,
      fee: fill.fee,
      createdAt: fill.createdAt,
      liquidity: fill.liquidity, // MAKER or TAKER
    })),
    pagination: {
      page,
      pageSize: response.pageSize,
      totalResults: response.totalResults,
      hasMore: response.offset + response.pageSize < response.totalResults,
    },
  };
}

// Calculate performance metrics
function calculatePerformanceMetrics(fills: any[]) {
  const trades = fills.filter((f) => f.side === 'SELL'); // Closes
  const wins = trades.filter((t) => parseFloat(t.realizedPnl) > 0);
  const losses = trades.filter((t) => parseFloat(t.realizedPnl) < 0);

  const totalPnl = trades.reduce(
    (sum, t) => sum + parseFloat(t.realizedPnl || '0'),
    0
  );

  return {
    totalTrades: trades.length,
    winRate: (wins.length / trades.length) * 100,
    avgWin: wins.reduce((s, t) => s + parseFloat(t.realizedPnl), 0) / wins.length,
    avgLoss: Math.abs(
      losses.reduce((s, t) => s + parseFloat(t.realizedPnl), 0) / losses.length
    ),
    totalPnl,
  };
}

// Usage
const history = await getTradingHistory('0x123...', 0, 1, 50);
const metrics = calculatePerformanceMetrics(history.fills);

console.log(`Win Rate: ${metrics.winRate.toFixed(1)}%`);
console.log(`Total P&L: $${metrics.totalPnl.toFixed(2)}`);
```

### STAR-121/126: Funding Rates

```typescript
// Get current and historical funding rates
async function getFundingData(ticker: string) {
  // Current rate
  const marketResponse = await indexerClient.markets.getPerpetualMarkets(ticker);
  const market = marketResponse.markets[ticker];

  // Historical rates
  const historyResponse =
    await indexerClient.markets.getPerpetualMarketHistoricalFunding(
      ticker,
      48 // Last 48 hours
    );

  return {
    current: {
      rate: parseFloat(market.nextFundingRate),
      ratePercentage: parseFloat(market.nextFundingRate) * 100,
      nextPaymentIn: calculateNextPayment(),
    },
    history: historyResponse.historicalFunding.map((h) => ({
      rate: parseFloat(h.rate),
      effectiveAt: h.effectiveAt,
      price: parseFloat(h.price),
    })),
  };
}

function calculateNextPayment(): { hours: number; minutes: number } {
  const now = new Date();
  const nextPayment = new Date(now);
  nextPayment.setHours(Math.ceil(now.getHours() / 8) * 8, 0, 0, 0);

  const diff = nextPayment.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

// Calculate funding cost estimate
function estimateFundingCost(
  positionSize: number,
  fundingRate: number,
  hoursHeld: number
): number {
  const paymentsCount = hoursHeld / 8;
  return positionSize * fundingRate * paymentsCount;
}

// Usage
const funding = await getFundingData('ETH-USD');
console.log(`Current Rate: ${funding.current.ratePercentage.toFixed(4)}%`);

const cost = estimateFundingCost(10000, funding.current.rate, 24);
console.log(`Estimated 24h funding cost: $${cost.toFixed(2)}`);
```

### STAR-122/123/124: Liquidity Provider

```typescript
// Get LP pool statistics
async function getLPPoolStats() {
  const positions = await indexerClient.vault.getMegavaultPositions();
  const historicalPnl = await indexerClient.vault.getMegavaultHistoricalPnl();

  const tvl = positions.positions.reduce(
    (sum, pos) => sum + parseFloat(pos.equity),
    0
  );

  return {
    tvl,
    apy7d: calculateAPY(historicalPnl.megavaultPnl.slice(0, 168)), // 7 days
    totalRLPSupply: '10000000', // Would come from contract
    rlpPrice: tvl / 10000000,
  };
}

// Calculate RLP tokens for deposit
function calculateRLPForDeposit(
  depositAmount: number,
  poolValue: number,
  totalRLPSupply: number
): number {
  return (depositAmount / poolValue) * totalRLPSupply;
}

// Calculate USD for RLP withdrawal
function calculateUSDForRLP(
  rlpAmount: number,
  poolValue: number,
  totalRLPSupply: number
): number {
  return (rlpAmount / totalRLPSupply) * poolValue;
}

function calculateAPY(pnlTicks: any[]): number {
  if (pnlTicks.length < 2) return 0;

  const start = parseFloat(pnlTicks[pnlTicks.length - 1].equity);
  const end = parseFloat(pnlTicks[0].equity);
  const periodReturn = (end - start) / start;

  // Annualize
  const periodsPerYear = (365 * 24) / pnlTicks.length;
  return periodReturn * periodsPerYear * 100;
}

// Usage
const poolStats = await getLPPoolStats();
console.log(`TVL: $${poolStats.tvl.toLocaleString()}`);
console.log(`7-day APY: ${poolStats.apy7d.toFixed(2)}%`);

const depositAmount = 10000;
const rlpReceived = calculateRLPForDeposit(
  depositAmount,
  poolStats.tvl,
  10000000
);
console.log(`Will receive ${rlpReceived.toFixed(2)} RLP tokens`);
```

### STAR-125: Error Handling

```typescript
// Wrap API calls with error handling
async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  errorMap: Record<string, string>
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (err: any) {
    const errorCode = err.code || 'UNKNOWN_ERROR';
    const errorMessage = errorMap[errorCode] || 'An unexpected error occurred';

    return {
      error: errorMessage,
    };
  }
}

// Test error triggers
async function testErrorTriggers() {
  // These addresses trigger specific errors (see errors.json)
  const errorAddresses = {
    insufficientBalance: '0x...bal',
    userRejected: '0x...rej',
    gasEstimationFailed: '0x...gas',
    walletLocked: '0x...lck',
    wrongNetwork: '0x...net',
  };

  // Example: Test insufficient balance error
  const result = await safeApiCall(
    () => indexerClient.account.getParentSubaccount(errorAddresses.insufficientBalance, 0),
    {
      INSUFFICIENT_BALANCE: 'You do not have enough USDC to complete this transaction',
    }
  );

  if (result.error) {
    console.error('Error:', result.error);
    // Show user-friendly error message
  }
}
```

### STAR-127: Network Switching

```typescript
// Handle network selection
interface NetworkConfig {
  id: 'testnet' | 'mainnet';
  chainId: string;
  rpcUrl: string;
  indexerUrl: string;
  contracts: Record<string, string>;
}

const networks: Record<string, NetworkConfig> = {
  testnet: {
    id: 'testnet',
    chainId: '0',
    rpcUrl: 'https://testnet.fuel.network/v1/graphql',
    indexerUrl: 'http://localhost:4000',
    contracts: {
      clearingHouse: '0x...0001',
      vault: '0x...0002',
    },
  },
  mainnet: {
    id: 'mainnet',
    chainId: '1',
    rpcUrl: 'https://mainnet.fuel.network/v1/graphql',
    indexerUrl: 'https://indexer.starboard.finance',
    contracts: {
      clearingHouse: '0x1...0001',
      vault: '0x1...0002',
    },
  },
};

function switchNetwork(networkId: 'testnet' | 'mainnet') {
  const network = networks[networkId];

  // Update indexer client
  const newClient = new IndexerClient({
    baseURL: network.indexerUrl,
  });

  // Update localStorage to persist selection
  localStorage.setItem('selectedNetwork', networkId);

  // Clear any cached data
  localStorage.removeItem(`positions-${networkId === 'testnet' ? 'mainnet' : 'testnet'}`);

  return { network, client: newClient };
}

// Usage
const { network, client } = switchNetwork('testnet');
console.log(`Switched to ${network.id}`);
```

## React Hooks Examples

### Custom Hook for Account Balance

```typescript
import { useQuery } from '@tanstack/react-query';

function useAccountBalance(address: string | undefined) {
  return useQuery({
    queryKey: ['accountBalance', address],
    queryFn: async () => {
      if (!address) return null;

      const response = await indexerClient.account.getParentSubaccount(address, 0);
      const equity = parseFloat(response.equity);
      const free = parseFloat(response.freeCollateral);

      return {
        equity: response.equity,
        freeCollateral: response.freeCollateral,
        usedCollateral: (equity - free).toString(),
        marginUtilization: ((equity - free) / equity) * 100,
      };
    },
    enabled: !!address,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Usage in component
function AccountBalanceWidget() {
  const { data: balance, isLoading } = useAccountBalance(userAddress);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <p>Equity: ${balance?.equity}</p>
      <p>Available: ${balance?.freeCollateral}</p>
      <ProgressBar value={balance?.marginUtilization} />
    </div>
  );
}
```

### Custom Hook for Positions

```typescript
function usePositions(address: string | undefined) {
  return useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      if (!address) return [];

      const response = await indexerClient.account.getPerpetualPositions(
        address,
        null,
        'OPEN'
      );

      return response.positions;
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
}
```

## Testing with Mock Data

### Jest/Vitest Tests

```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Mock Indexer Integration', () => {
  let client: IndexerClient;

  beforeAll(() => {
    client = new IndexerClient({
      baseURL: 'http://localhost:4000',
    });
  });

  it('should fetch markets', async () => {
    const response = await client.markets.getPerpetualMarkets();
    expect(Object.keys(response.markets)).toHaveLength(4);
    expect(response.markets['ETH-USD']).toBeDefined();
  });

  it('should fetch account data', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const response = await client.account.getParentSubaccount(address, 0);

    expect(response.address).toBe(address.toLowerCase());
    expect(parseFloat(response.equity)).toBeGreaterThan(0);
  });

  it('should return consistent data for same address', async () => {
    const address = '0x1234567890123456789012345678901234567890';

    const response1 = await client.account.getParentSubaccount(address, 0);
    const response2 = await client.account.getParentSubaccount(address, 0);

    expect(response1.equity).toBe(response2.equity);
  });
});
```

## Next Steps

- Review [mock-data-map.md](./mock-data-map.md) for complete endpoint documentation
- Check [story-requirements-analysis.md](./story-requirements-analysis.md) for detailed requirements
- See [../README.md](../README.md) for setup instructions






# Mock Data Story Mapping

Complete mapping of Implementation EPIC stories to mock data endpoints, entities, and fields.

## Table of Contents

- [STAR-113: View Account Balance and Collateral](#star-113-view-account-balance-and-collateral)
- [STAR-107/108: Open Long/Short Position](#star-107108-open-longshort-position)
- [STAR-116: View Current Positions](#star-116-view-current-positions)
- [STAR-117: Close Positions](#star-117-close-positions)
- [STAR-118: View Market Data and Charts](#star-118-view-market-data-and-charts)
- [STAR-119: Connect Fuel Wallet](#star-119-connect-fuel-wallet)
- [STAR-120: View Trading History](#star-120-view-trading-history)
- [STAR-121/126: Monitor Funding Rates & Costs](#star-121126-monitor-funding-rates--costs)
- [STAR-122/123/124: Liquidity Provider Flows](#star-122123124-liquidity-provider-flows)
- [STAR-125: Handle Transaction Errors](#star-125-handle-transaction-errors)
- [STAR-127: Select Network](#star-127-select-network)

---
m
## STAR-113: View Account Balance and Collateral

**Goal:** Display account balance, available/used collateral, and margin health.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/addresses/:address/parentSubaccountNumber/:num` | Get aggregated account data |
| GET | `/v4/addresses/:address/subaccountNumber/:num` | Get specific subaccount |
| GET | `/v4/assetPositions?address=...` | Get USDC balance |
| GET | `/v4/perpetualPositions?address=...&status=OPEN` | Get open positions for collateral calc |

### GraphQL Queries

```graphql
query GetAccountBalance($address: String!) {
  accounts(address: $address) {
    equity
    freeCollateral
    assetPositions {
      symbol
      size
    }
    positions(status: OPEN) {
      size
      entryPrice
      collateral
    }
  }
}
```

### Data Entities

**ParentSubaccount:**
```typescript
{
  address: string;
  parentSubaccountNumber: number;
  equity: string;              // Total USDC value (6 decimals)
  freeCollateral: string;      // Available for new positions
  childSubaccounts: Subaccount[];
}
```

**Calculated Fields:**
```typescript
{
  usedCollateral: equity - freeCollateral,
  marginUtilization: (usedCollateral / equity) * 100,
  healthColor: utilization < 50 ? 'green' : utilization < 80 ? 'yellow' : 'red'
}
```

### Edge Cases Covered

- Empty account (new user): `equity: "0"`
- High utilization: `marginUtilization > 80%`
- Negative available (over-leveraged): `freeCollateral < 0`

### Mock Data Example

```typescript
// GET /v4/addresses/0x123.../parentSubaccountNumber/0
{
  "address": "0x123...",
  "parentSubaccountNumber": 0,
  "equity": "245000.00",
  "freeCollateral": "120000.00",
  "childSubaccounts": [...]
}
```

---

## STAR-107/108: Open Long/Short Position

**Goal:** Allow users to open leveraged positions with proper validation.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/perpetualMarkets` | Get all markets with leverage limits |
| GET | `/v4/perpetualMarkets?ticker=ETH-USD` | Get specific market |
| GET | `/v4/orderbooks/perpetualMarket/:market` | Get current prices |

### GraphQL Queries

```graphql
query GetMarketDetails($ticker: String!) {
  markets(ticker: $ticker) {
    ticker
    oraclePrice {
      price
    }
    initialMarginFraction
    maintenanceMarginFraction
    openInterest
    status
  }
}
```

### Data Entities

**Market (Extended):**
```typescript
{
  ticker: string;
  clobPairId: string;
  oraclePrice: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  initialMarginFraction: string;    // e.g. "0.05" = 20x max
  maintenanceMarginFraction: string; // e.g. "0.025"
  // Additional fields in fixture:
  minLeverage: number;  // 2
  maxLeverage: number;  // 20 for BTC/ETH, 10 for FUEL/stFUEL
  makerFee: string;     // "0.0002"
  takerFee: string;     // "0.0005"
  minPositionSize: string; // "10"
  maxPositionSize: string; // "1000000"
}
```

### Calculations Needed

```typescript
// Liquidation price
liquidationPrice_long = entryPrice * (1 - 1/leverage + fees)
liquidationPrice_short = entryPrice * (1 + 1/leverage - fees)

// Required collateral
requiredCollateral = positionSize / leverage

// Total fees
totalFees = tradingFee + fundingFeeEstimate + networkFee
```

### Edge Cases Covered

- Position too small: `size < 10`
- Position too large: `size > 1000000`
- Invalid leverage: `leverage < 2 || leverage > maxLeverage`
- Insufficient collateral: `freeCollateral < requiredCollateral`

### Mock Data Example

```typescript
// GET /v4/perpetualMarkets?ticker=ETH-USD
{
  "markets": {
    "ETH-USD": {
      "ticker": "ETH-USD",
      "oraclePrice": "3200.42",
      "initialMarginFraction": "0.05",  // 20x max
      "maintenanceMarginFraction": "0.025",
      "status": "ACTIVE",
      "tickSize": "0.01",
      "stepSize": "1"
    }
  }
}
```

---

## STAR-116: View Current Positions

**Goal:** Display all open positions with P&L and risk metrics.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/perpetualPositions?address=...&status=OPEN` | Get open positions |
| GET | `/v4/perpetualMarkets` | Get current prices for P&L |
| GET | `/v4/fundingPayments?address=...` | Get funding history |

### GraphQL Queries

```graphql
query GetPositions($address: String!) {
  accounts(address: $address) {
    positions(status: OPEN) {
      market
      side
      size
      entryPrice
      unrealizedPnl
      netFunding
      createdAt
    }
  }
}
```

### Data Entities

**Position (Extended):**
```typescript
{
  market: string;
  status: 'OPEN' | 'CLOSED';
  side: 'LONG' | 'SHORT';
  size: string;
  maxSize: string;
  entryPrice: string;
  unrealizedPnl: string;
  realizedPnl: string;
  netFunding: string;          // Cumulative funding paid/received
  createdAt: string;           // ISO timestamp
  subaccountNumber: number;
  
  // Calculated fields:
  roe: number;                 // (unrealizedPnl / initialMargin) * 100
  liquidationPrice: string;
  marginRatio: number;
  timeHeld: number;            // hours
}
```

### Calculations Needed

```typescript
// ROE (Return on Equity)
initialMargin = entryPrice * size / leverage
roe = (unrealizedPnl / initialMargin) * 100

// Margin Ratio
marginRatio = (collateral / positionValue) * 100
healthStatus = marginRatio > 50 ? 'safe' : marginRatio > 20 ? 'warning' : 'danger'
```

### Edge Cases Covered

- No positions (new user)
- Position near liquidation: `marginRatio < 25%`
- Large P&L: `|unrealizedPnl| > initialMargin`

### Mock Data Example

```typescript
// GET /v4/perpetualPositions?address=0x123...&status=OPEN
{
  "positions": [
    {
      "market": "ETH-USD",
      "side": "LONG",
      "size": "25000000",  // 0.025 ETH in base units
      "entryPrice": "3150.50",
      "unrealizedPnl": "1250.00",
      "netFunding": "-45.23",
      "createdAt": "2024-11-09T12:00:00Z",
      "status": "OPEN"
    }
  ]
}
```

---

## STAR-117: Close Positions

**Goal:** Allow partial or full position closure with fee estimates.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/perpetualPositions?address=...` | Get position to close |
| GET | `/v4/perpetualMarkets?ticker=...` | Get current market price |
| GET | `/v4/orderbooks/perpetualMarket/:market` | Get execution price estimate |

### Data for Close Modal

```typescript
{
  currentPosition: Position;
  closeOptions: [25, 50, 75, 100]; // Percentages
  estimatedExit: {
    price: string;
    fees: {
      trading: string;
      funding: string;
      network: string;
    };
    grossPnL: string;
    netPnL: string;
  }
}
```

### Calculations Needed

```typescript
// Close size
closeSize = position.size * (closePercentage / 100)

// P&L
grossPnL = (exitPrice - entryPrice) * closeSize * sideMultiplier

// Fees
tradingFee = closeSize * exitPrice * takerFeeRate
fundingFee = calculateAccruedFunding(position)
networkFee = estimateGas()
totalFees = tradingFee + fundingFee + networkFee

// Net P&L
netPnL = grossPnL - totalFees
```

### Edge Cases Covered

- Dust amount warning: `remainingSize < minPositionSize`
- Slippage on large closes
- Minimum close amount: `closeSize * price >= 10`

---

## STAR-118: View Market Data and Charts

**Goal:** Display price charts, orderbooks, and market statistics.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/candles/perpetualMarkets/:market?resolution=...` | Get OHLCV data |
| GET | `/v4/orderbooks/perpetualMarket/:market` | Get orderbook |
| GET | `/v4/trades/perpetualMarket/:market` | Get recent trades |
| GET | `/v4/sparklines` | Get 24h mini-charts |

### GraphQL Queries

```graphql
query GetChartData($ticker: String!, $resolution: String!) {
  candles(market: $ticker, resolution: $resolution, first: 100) {
    startedAt
    open
    high
    low
    close
    usdVolume
    baseTokenVolume
  }
}
```

### Data Entities

**Candle:**
```typescript
{
  startedAt: string;           // ISO timestamp
  ticker: string;
  resolution: '1MIN' | '5MINS' | '15MINS' | '30MINS' | '1HOUR' | '4HOURS' | '1DAY';
  open: string;
  high: string;
  low: string;
  close: string;
  baseTokenVolume: string;
  usdVolume: string;
  trades: number;              // Number of trades in period
  startingOpenInterest: string;
}
```

**Market Stats (24h):**
```typescript
{
  ticker: string;
  price: string;
  priceChange24H: string;
  volume24H: string;
  trades24H: number;
  high24h: string;
  low24h: string;
  openInterest: string;
}
```

### Resolutions Available

- 1MIN (1 minute)
- 5MINS (5 minutes)
- 15MINS (15 minutes)
- 30MINS (30 minutes)
- 1HOUR (1 hour)
- 4HOURS (4 hours)
- 1DAY (1 day)

### Mock Data Volume

- 60 candles per resolution
- Historical depth: ~60 periods back

### Edge Cases Covered

- Missing candles (gaps in time)
- Zero volume periods
- Extreme price movements

---

## STAR-120: View Trading History

**Goal:** Display historical trades with performance analytics.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/fills?address=...&subaccountNumber=...` | Get trade fills |
| GET | `/v4/fills/parentSubaccountNumber?address=...&parentSubaccountNumber=...` | Get all fills |
| GET | `/v4/transfers?address=...` | Get deposit/withdrawal history |
| GET | `/v4/historical-pnl?address=...` | Get P&L time series |

### Data Entities

**Fill:**
```typescript
{
  id: string;
  side: 'BUY' | 'SELL';
  market: string;
  price: string;
  size: string;
  fee: string;
  liquidity: 'MAKER' | 'TAKER';
  createdAt: string;
  orderId: string | null;
  subaccountNumber: number;
}
```

**Performance Metrics (Calculated):**
```typescript
{
  totalTrades: number;
  winRate: number;             // % profitable
  avgWin: string;
  avgLoss: string;
  totalPnL: string;
  sharpeRatio: number;
  maxDrawdown: string;
  profitFactor: number;        // gross_profit / gross_loss
}
```

### Pagination

```typescript
{
  fills: Fill[];
  pageSize: number;
  offset: number;
  totalResults: number;
}
```

### Edge Cases Covered

- No trading history (new user)
- Large history (1000+ trades): pagination
- Partial fills

---

## STAR-121/126: Monitor Funding Rates & Costs

**Goal:** Display funding rates and calculate funding costs.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/perpetualMarkets` | Get current funding rate |
| GET | `/v4/perpetualMarkets/historicalFunding?ticker=...` | Get historical rates |
| GET | `/v4/fundingPayments?address=...` | Get actual payments made |

### Data Entities

**Historical Funding:**
```typescript
{
  ticker: string;
  rate: string;                // Funding rate (e.g. "0.000125" = 0.0125%)
  price: string;               // Oracle price at time
  effectiveAt: string;         // ISO timestamp
  effectiveAtHeight: string;
}
```

**Funding Payment:**
```typescript
{
  createdAt: string;
  ticker: string;
  oraclePrice: string;
  size: string;
  side: 'LONG' | 'SHORT';
  rate: string;
  payment: string;             // Amount paid (negative) or received (positive)
}
```

### Calculations Needed

```typescript
// Next payment timestamp (every 8 hours)
nextPayment = Math.ceil(now / (8 * 3600)) * (8 * 3600)

// Estimated cost
estimatedCost = positionSize * fundingRate * (hoursHeld / 8)

// Annualized rate
annualizedRate = fundingRate * 3 * 365  // 3 payments per day
```

### Mock Data

- 48 hours of historical funding rates
- Rates range: -0.002 to 0.002 (-0.2% to 0.2%)
- Payments every 8 hours

### Edge Cases Covered

- Negative rates (shorts pay longs)
- Extreme rates (> 0.05%)
- Missing funding data

---

## STAR-122/123/124: Liquidity Provider Flows

**Goal:** Enable LP deposits/withdrawals and display performance.

### REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v4/vault/v1/megavault/positions` | Get pool composition |
| GET | `/v4/vault/v1/megavault/historicalPnl` | Get pool P&L history |
| GET | `/v4/vault/v1/vaults/historicalPnl` | Get per-market vault P&L |

### Data Entities

**Vault Position:**
```typescript
{
  ticker: string;
  assetPosition: {
    symbol: string;
    size: string;
    side: 'LONG' | 'SHORT';
  };
  perpetualPosition: Position;
  equity: string;
}
```

**Pool Stats (Calculated):**
```typescript
{
  tvl: string;                 // Total Value Locked
  apy7d: string;               // 7-day APY
  apy30d: string;              // 30-day APY
  utilization: number;         // % of TVL in positions
  totalRLPSupply: string;
  rlpPrice: string;            // TVL / supply
}
```

**LP Position:**
```typescript
{
  rlpBalance: string;
  usdValue: string;
  poolShare: number;           // % of total pool
  depositedAt: string;
  cooldownEndsAt: string | null;
  feesEarned: {
    daily: string;
    weekly: string;
    allTime: string;
  };
}
```

### Calculations Needed

```typescript
// RLP calculation
rlp_to_mint = (depositAmount / poolValue) * totalRLPSupply
usd_to_receive = (rlpAmount / totalRLPSupply) * poolValue

// APY calculation
periodReturn = (endEquity - startEquity) / startEquity
annualizedAPY = periodReturn * (365 / days) * 100

// Fee attribution
tradingFees = sum(all_trading_fees) * poolShare
fundingFees = sum(all_funding_received) * poolShare
```

### Edge Cases Covered

- Cooldown period active (24 hours)
- Pool at max capacity
- High utilization (> 90%)
- Minimum deposit/withdrawal amounts

---

## STAR-125: Handle Transaction Errors

**Goal:** Provide clear, actionable error messages.

### Error Response Format

```typescript
{
  code: string;                // Machine-readable error code
  message: string;             // User-friendly message
  httpStatus: number;          // HTTP status code
  details?: any;               // Technical details
  suggestedAction?: {
    label: string;             // e.g. "Deposit USDC"
    action: string;            // e.g. "navigate_deposit"
  }
}
```

### Error Categories

**Validation Errors (400):**
- `INSUFFICIENT_BALANCE`
- `INVALID_LEVERAGE`
- `POSITION_TOO_SMALL`
- `POSITION_TOO_LARGE`
- `WOULD_BE_LIQUIDATED`

**Network Errors (500/503/504):**
- `RPC_TIMEOUT`
- `CONNECTION_LOST`
- `GAS_ESTIMATION_FAILED`

**Contract Errors (400/503):**
- `SLIPPAGE_EXCEEDED`
- `CONTRACT_PAUSED`
- `MARKET_CLOSED`
- `INSUFFICIENT_LIQUIDITY`

**Wallet Errors (400/401):**
- `USER_REJECTED`
- `WALLET_LOCKED`
- `WRONG_NETWORK`
- `WALLET_NOT_CONNECTED`

### Triggers

Address patterns trigger specific errors:
- `0x...bal` → `INSUFFICIENT_BALANCE`
- `0x...rej` → `USER_REJECTED`
- `0x...gas` → `GAS_ESTIMATION_FAILED`
- `0x...net` → `WRONG_NETWORK`

### Mock Data Location

`mocks/fixtures/errors.json`

---

## STAR-127: Select Network

**Goal:** Switch between testnet and mainnet with data isolation.

### Network Config

```typescript
{
  id: 'testnet' | 'mainnet';
  name: string;
  chainId: string;
  rpcUrl: string;
  indexerUrl: string;
  explorerUrl: string;
  contracts: {
    clearingHouse: string;
    vault: string;
    oracle: string;
    rlpToken: string;
  };
  faucetUrl?: string;          // Testnet only
}
```

### Data Isolation

- Separate fixtures for testnet/mainnet
- Network-prefixed cache keys
- Separate indexer endpoints
- Different contract addresses

### Mock Data Location

`mocks/fixtures/networks.json`

### Edge Cases Covered

- Wrong network in wallet
- Network switch during transaction
- Stale cached data
- Network unavailable

---

## Summary Table

| Story | Primary Endpoints | Key Calculations | Mock Data Files |
|-------|------------------|------------------|-----------------|
| STAR-113 | `/v4/addresses/.../parentSubaccountNumber/...` | Margin utilization | N/A (generated) |
| STAR-107/108 | `/v4/perpetualMarkets` | Liquidation price, leverage | `markets.json` |
| STAR-116 | `/v4/perpetualPositions` | ROE, margin ratio | N/A (generated) |
| STAR-117 | Same as 116 | Close P&L, fees | N/A (generated) |
| STAR-118 | `/v4/candles/...`, `/v4/orderbooks/...` | 24h stats | N/A (generated) |
| STAR-119 | N/A (wallet-only) | N/A | `networks.json` |
| STAR-120 | `/v4/fills`, `/v4/historical-pnl` | Win rate, Sharpe ratio | N/A (generated) |
| STAR-121/126 | `/v4/perpetualMarkets/historicalFunding` | Next payment, cost estimate | N/A (generated) |
| STAR-122/123/124 | `/v4/vault/v1/megavault/...` | RLP calculation, APY | N/A (generated) |
| STAR-125 | All endpoints | N/A | `errors.json` |
| STAR-127 | N/A (config-only) | N/A | `networks.json` |

## Next Steps

1. See [usage-examples.md](./usage-examples.md) for code implementation
2. Review [story-requirements-analysis.md](./story-requirements-analysis.md) for detailed requirements
3. Check [../README.md](../README.md) for setup instructions






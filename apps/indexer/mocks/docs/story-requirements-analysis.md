# Story Data Requirements Analysis

Detailed breakdown of data requirements for each Implementation EPIC story.

## STAR-113: View Account Balance and Collateral

### Required Data
- **Account equity** (total USDC with 6 decimal precision)
- **Free collateral** (available for new positions)
- **Used collateral** (locked in existing positions)
- **Margin utilization** percentage
- **Collateral breakdown** per position with percentages

### Calculations Needed
```typescript
margin_utilization = (used_collateral / total_balance) * 100
available_collateral = total_balance - used_collateral - pending_orders
```

### Color Coding
- Green: 0-50% utilization
- Yellow: 50-80% utilization  
- Red: 80-100% utilization

### Edge Cases
- Empty account (new user)
- 100% utilization (at risk)
- Negative available collateral (over-leveraged)

---

## STAR-107/108: Open Long/Short Position

### Required Data per Market
- **Leverage limits**
  - BTC/ETH: 2x-20x
  - FUEL/stFUEL: 2x-10x
- **Position size validation**
  - Min: $10
  - Max: $1,000,000
- **Fee breakdown**
  - Trading fee (maker/taker)
  - Funding fee estimate
  - Network gas fee
- **Liquidation price calculation**
  - Long: `entry_price * (1 - 1/leverage + fees)`
  - Short: `entry_price * (1 + 1/leverage - fees)`

### Additional Fields Needed
```typescript
market: {
  ...existing,
  minLeverage: number;
  maxLeverage: number;
  minPositionSize: string;
  maxPositionSize: string;
  makerFee: string;  // e.g. "0.0002"
  takerFee: string;  // e.g. "0.0005"
}
```

### Edge Cases
- Maximum leverage boundary
- Minimum position size
- Insufficient collateral
- Market paused/halted

---

## STAR-116/117: View/Close Current Positions

### Required Position Fields
- Entry price, current price, mark price
- Unrealized P&L
- ROE (Return on Equity)
- Funding paid/received (cumulative)
- Fees paid
- Liquidation price
- Time held

### Calculations
```typescript
unrealized_pnl = (mark_price - entry_price) * size * side_multiplier
roe = (unrealized_pnl / initial_margin) * 100
margin_ratio = (collateral / position_value) * 100
```

### Position Close Data
- Exit price estimate
- Fee breakdown for closing
- Final P&L calculation
- Partial close options (25%, 50%, 75%, 100%)

### Edge Cases
- Position at liquidation risk
- Dust amounts after partial close
- Negative P&L close

---

## STAR-118: View Market Data and Charts

### Required Market Data
- **OHLCV candles** for all timeframes:
  - 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- **24h statistics**
  - High, Low, Volume, Price change %
  - Open interest
  - Number of trades
- **Orderbook depth**
  - Top 5-10 bids/asks
  - Spread calculation
- **Technical indicators** (metadata for TradingView)
  - Support for MA, EMA, RSI, MACD, Bollinger Bands

### Data Volume
- 60 candles per resolution (minimum for charts)
- Historical depth: 30 days for 1m, 1 year for 1d

### Edge Cases
- Missing candles (gaps in data)
- Extreme price movements
- Zero volume periods

---

## STAR-120: View Trading History

### Required Data per Fill
- Timestamp, market, side, price, size
- Fee paid
- Liquidity type (maker/taker)
- Order ID reference
- Realized P&L

### Aggregate Performance Metrics
```typescript
performanceMetrics: {
  totalPnL: string;
  winRate: number;  // % of profitable trades
  avgWin: string;
  avgLoss: string;
  sharpeRatio: number;
  maxDrawdown: string;
  numTrades: number;
  profitFactor: number;  // gross_profit / gross_loss
}
```

### Cumulative P&L Series
- Time-series data for charting
- Daily/hourly buckets

### Edge Cases
- No trading history (new user)
- Very large history (1000+ trades)
- Trades spanning multiple accounts

---

## STAR-121/126: Monitor Funding Rates & Costs

### Required Funding Data
- **Current rate** (% per 8 hours)
- **Historical rates** (48+ data points, hourly)
- **Predicted rate** (based on OI imbalance)
- **Next payment timestamp**
- **Cumulative funding per position**

### Calculation Fields
```typescript
fundingPayment: {
  rate: string;  // Current funding rate
  predictedRate: string;  // Next rate estimate
  nextPaymentAt: string;  // ISO timestamp
  hoursUntilPayment: number;
  positionFunding: {
    cumulative: string;  // Total paid/received
    avgRate: string;
  }
}
```

### Funding Cost Calculator
```typescript
estimatedCost = position_size * funding_rate * (hours_held / 8)
```

### Edge Cases
- Negative funding rates (shorts pay longs)
- Extreme rates (>0.05%)
- Funding payment failures

---

## STAR-122/123/124: Liquidity Provider Flows

### Pool Statistics
```typescript
poolStats: {
  tvl: string;
  apy7d: string;
  apy30d: string;
  utilization: number;  // % of TVL used
  totalRLPSupply: string;
  rlpPrice: string;  // USDC per RLP
}
```

### LP Position Data
```typescript
lpPosition: {
  rlpBalance: string;
  usdValue: string;
  poolShare: number;  // % of total pool
  depositedAt: string;
  cooldownEndsAt: string | null;
  canWithdraw: boolean;
  feesEarned: {
    daily: string;
    weekly: string;
    allTime: string;
  };
  traderPnlExposure: string;  // Current exposure
}
```

### RLP Calculation
```typescript
rlp_to_receive = (deposit_amount / pool_value) * total_rlp_supply
rlp_to_burn = (withdraw_usd / pool_value) * total_rlp_supply
```

### Performance Metrics
```typescript
lpPerformance: {
  apy: string;
  sharpeRatio: number;
  maxDrawdown: string;
  feeAttribution: {
    tradingFees: string;
    fundingFees: string;
  };
  impermanentLoss: string;  // vs holding USDC
}
```

### Edge Cases
- Cooldown period active
- Pool at max capacity
- High utilization (>90%)
- Emergency withdrawal mode

---

## STAR-125: Handle Transaction Errors

### Error Categories
1. **Validation Errors** (pre-flight)
   - Insufficient balance
   - Invalid parameters
   - Market closed

2. **Network Errors**
   - RPC timeout
   - Connection lost
   - Gas estimation failed

3. **Contract Errors**
   - Position would be liquidated
   - Slippage exceeded
   - Contract paused

4. **Wallet Errors**
   - User rejected
   - Wallet locked
   - Wrong network

### Error Response Format
```typescript
error: {
  code: string;  // e.g. "INSUFFICIENT_BALANCE"
  message: string;  // User-friendly message
  details?: any;  // Technical details
  suggestedAction?: {
    label: string;
    action: string;
  }
}
```

### Deterministic Triggers
- Addresses ending in "err" -> generic error
- Addresses ending in "gas" -> insufficient gas
- Addresses ending in "rej" -> user rejection
- Amounts > 999,999 -> slippage error

### Edge Cases
- Unknown error codes
- Multiple simultaneous errors
- Error during error recovery

---

## STAR-127: Select Network (Testnet/Mainnet)

### Network-Specific Data
```typescript
network: {
  id: 'testnet' | 'mainnet';
  chainId: string;
  rpcUrl: string;
  indexerUrl: string;
  explorerUrl: string;
  contracts: {
    [key: string]: string;  // Contract addresses
  }
}
```

### Data Isolation Requirements
- Separate database schemas/tables
- Network-prefixed cache keys
- Separate indexer endpoints
- No data leakage between networks

### Network-Specific Fixtures
- Testnet: Smaller values, test tokens
- Mainnet: Production-like values

### Edge Cases
- Wrong network in wallet
- Network switch while transaction pending
- Stale data from previous network
- Network unavailable

---

## Summary: Priority Enhancements

### High Priority (Core Functionality)
1. STAR-113: Margin calculations
2. STAR-107/108: Leverage limits and liquidation prices
3. STAR-116: ROE and expanded position details
4. STAR-120: Performance metrics

### Medium Priority (User Experience)
5. STAR-118: Complete candle data
6. STAR-121/126: Funding predictions
7. STAR-122/123/124: LP metrics
8. STAR-125: Error states

### Lower Priority (Nice to Have)
9. STAR-127: Network isolation

---

## Implementation Notes

- All monetary values use 6 decimals for USDC
- All calculations should handle edge cases gracefully
- Mock data should include both happy path and edge cases
- Deterministic generation ensures consistency






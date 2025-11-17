# Starboard Mock Data System

Comprehensive mock data infrastructure for Starboard Finance frontend development.

## Quick Start

### In-Memory Mode (Default - Recommended)

Fast, deterministic mocks with no Docker required:

```bash
# From workspace root
pnpm --filter indexer dev

# The mock server starts with multiple endpoints:
# REST API: http://localhost:4000/v4/*
# GraphQL: http://localhost:4000/graphql
# WebSocket: ws://localhost:4001

```

### Database Mode (Optional)

Persistent mocks backed by PostgreSQL:

```bash
# 1. Start PostgreSQL
cd apps/indexer
docker-compose up -d

# 2. Run seed scripts (coming soon)
pnpm seed:reset

# 3. Start with database mode
MOCK_DATA_SOURCE=database pnpm --filter indexer dev
```

## Architecture

### Provider Pattern

The mock system uses a provider pattern with environment variable switching:

```typescript
// Automatically selected based on MOCK_DATA_SOURCE env var
const provider = createMockDataProvider();

// 'memory' (default): Fast, stateless, in-memory
// 'database': Persistent, TypeORM-backed PostgreSQL
```

### Directory Structure

```
apps/indexer/
├── mocks/
│   ├── fixtures/           # JSON fixtures for test data
│   │   ├── markets.json    # Market definitions (testnet/mainnet)
│   │   ├── networks.json   # Network configurations
│   │   └── errors.json     # Error state definitions
│   ├── variants/           # Edge case scenarios
│   │   ├── empty-states.json
│   │   ├── edge-cases.json
│   │   └── error-states.json
│   └── docs/              # Documentation
│       ├── mock-data-map.md
│       ├── usage-examples.md
│       └── story-requirements-analysis.md
├── src/
│   ├── providers/         # Provider implementations
│   │   ├── MockDataProvider.interface.ts
│   │   ├── InMemoryMockProvider.ts
│   │   ├── DatabaseMockProvider.ts
│   │   └── index.ts       # Factory function
│   ├── rest-routes.ts     # REST API routes
│   └── seeds/             # Database seed scripts (coming soon)
└── mock-server.ts         # Server entry point
```

## Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `MOCK_DATA_SOURCE` | `memory`, `database` | `memory` | Data source for mocks |
| `DB_PORT` | number | `5432` | PostgreSQL port (database mode only) |

## API Endpoints

### REST API (dYdX v4 Compatible)

All endpoints are prefixed with `/v4/`:

**Markets:**
- `GET /v4/perpetualMarkets` - List all markets
- `GET /v4/orderbooks/perpetualMarket/:market` - Get orderbook
- `GET /v4/trades/perpetualMarket/:market` - Get recent trades
- `GET /v4/candles/perpetualMarkets/:market` - Get OHLCV candles
- `GET /v4/perpetualMarkets/historicalFunding` - Get funding history
- `GET /v4/sparklines` - Get price sparklines

**Accounts:**
- `GET /v4/addresses/:address` - Get account overview
- `GET /v4/addresses/:address/subaccountNumber/:num` - Get subaccount
- `GET /v4/addresses/:address/parentSubaccountNumber/:num` - Get parent subaccount

**Positions:**
- `GET /v4/perpetualPositions?address=...` - Get positions
- `GET /v4/assetPositions?address=...` - Get asset positions

**Orders:**
- `GET /v4/orders?address=...&subaccountNumber=...` - Get orders
- `GET /v4/orders/:orderId` - Get specific order

**Fills:**
- `GET /v4/fills?address=...&subaccountNumber=...` - Get trade fills

**Transfers:**
- `GET /v4/transfers?address=...&subaccountNumber=...` - Get transfers
- `GET /v4/transfers/between?...` - Get transfers between accounts

**Funding:**
- `GET /v4/fundingPayments?address=...` - Get funding payments

**Historical Data:**
- `GET /v4/historical-pnl?address=...` - Get historical P&L
- `GET /v4/historicalTradingRewardAggregations/:address` - Get trading rewards
- `GET /v4/historicalBlockTradingRewards/:address` - Get block rewards

**Vault:**
- `GET /v4/vault/v1/megavault/positions` - Get megavault positions
- `GET /v4/vault/v1/megavault/historicalPnl` - Get megavault P&L
- `GET /v4/vault/v1/vaults/historicalPnl` - Get vault P&L

**Utility:**
- `GET /v4/time` - Get server time
- `GET /v4/height` - Get blockchain height
- `GET /v4/screen?address=...` - Screen address for compliance
- `GET /v4/compliance/screen/:address` - Compliance check v2

### GraphQL API

Available at `/graphql` with the same data, using a Subsquid-like schema.

Example query:
```graphql
query {
  markets(first: 10) {
    id
    ticker
    oraclePrice {
      price
      timestamp
    }
    volume24H
  }
}
```

### WebSocket API

Real-time data streaming available at `ws://localhost:4001`.

**Supported Channels:**
- `v4_parent_subaccounts` - Account balance updates
- `v4_subaccounts` - Child subaccount data
- `v4_markets` - Market price updates
- `v4_orderbook/{ticker}` - Orderbook changes
- `v4_trades/{ticker}` - Trade updates

**Example Usage:**
```javascript
const ws = new WebSocket('ws://localhost:4001');

ws.onopen = () => {
  // Subscribe to account balance
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'v4_parent_subaccounts',
    id: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/0'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

For full WebSocket documentation, see [WEBSOCKET_GUIDE.md](../WEBSOCKET_GUIDE.md).

## Mock Data Characteristics

### Deterministic Generation

All mock data is deterministically generated using seed-based hashing. The same input always produces the same output:

```typescript
// Same address always returns same account data
getSubaccount('0x123...', 0) // Always returns consistent data
```

### Data Patterns

#### Markets
- **4 markets**: ETH-USD, BTC-USD, FUEL-USD, stFUEL-USD
- BTC/ETH: 2x-20x leverage
- FUEL/stFUEL: 2x-10x leverage
- Realistic pricing and volumes

#### Accounts
- Equity: $80k-$350k
- 2-4 open positions per account
- Randomized but consistent per address

#### Positions
- Mix of LONG/SHORT
- Mix of OPEN/CLOSED status
- Realistic P&L values

#### Time-Series Data
- Candles: 60 data points per resolution
- Funding: 48 hours of history
- P&L: 24 hourly ticks

## Story Coverage

The mock system provides data for all Implementation EPIC stories:

| Story | Coverage | Key Data |
|-------|----------|----------|
| STAR-113 | ✅ Complete | Account balance, collateral, margin utilization |
| STAR-107/108 | ✅ Complete | Markets with leverage limits, position data |
| STAR-116/117 | ✅ Complete | Positions with P&L, funding, close estimates |
| STAR-118 | ✅ Complete | OHLCV candles, orderbooks, 24h stats |
| STAR-119 | ✅ Complete | Wallet connection, network validation |
| STAR-120 | ✅ Complete | Trading history, fills, performance metrics |
| STAR-121/126 | ✅ Complete | Funding rates, payments, predictions |
| STAR-122/123/124 | ✅ Complete | LP positions, pool stats, performance |
| STAR-125 | ✅ Complete | Error states with triggers |
| STAR-127 | ✅ Complete | Testnet/mainnet isolation |

## Error State Testing

### Triggering Errors by Address Pattern

The mock system can trigger specific errors based on address suffixes:

```typescript
// Addresses ending in specific patterns trigger errors
'0x...err' // Generic error
'0x...gas' // Gas estimation failed
'0x...rej' // User rejected transaction
'0x...lck' // Wallet locked
'0x...net' // Wrong network
'0x...bal' // Insufficient balance
'0x...liq' // Insufficient liquidity
'0x...slp' // Slippage exceeded
```

### Compliance Screening

```typescript
// Addresses ending in '00' are flagged as restricted
'0x...00' // restricted: true

// Addresses ending in 'ff' trigger FIRST_STRIKE status
'0x...ff' // status: FIRST_STRIKE
```

## Network Isolation

Data is isolated between testnet and mainnet:

- Different market prices
- Different contract addresses
- Separate RPC/indexer URLs
- No cross-network contamination

## Customizing Mock Data

### 1. Modify Fixtures

Edit JSON files in `mocks/fixtures/`:

```json
// mocks/fixtures/markets.json
{
  "testnet": [
    {
      "ticker": "YOUR-MARKET",
      "basePrice": 123.45,
      ...
    }
  ]
}
```

### 2. Extend InMemoryMockProvider

Add custom logic in `src/providers/InMemoryMockProvider.ts`:

```typescript
class InMemoryMockProvider implements MockDataProvider {
  // Add your custom methods
  getCustomData() {
    // Your logic here
  }
}
```

### 3. Database Seeds (Coming Soon)

Create seed scripts in `src/seeds/`:

```typescript
// src/seeds/001-my-data.seed.ts
export async function seedMyData(db: DataSource) {
  // Insert custom data
}
```

## Troubleshooting

### Mock server won't start

**Problem:** Port 4000 already in use

**Solution:**
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port
PORT=4001 pnpm --filter indexer dev
```

### Data looks incorrect

**Problem:** Expected different values

**Solution:** Mock data is deterministic. Same input = same output. Use different addresses/parameters to see variety.

### Database mode not working

**Problem:** Can't connect to PostgreSQL

**Solution:**
```bash
# 1. Ensure Docker is running
docker ps

# 2. Check PostgreSQL is up
cd apps/indexer
docker-compose ps

# 3. Check connection
docker-compose logs db

# 4. Restart if needed
docker-compose restart db
```

### GraphQL playground not loading

**Problem:** /graphql endpoint returns 404

**Solution:** Ensure mock server is running. The GraphQL endpoint is only available when the server is running.

### Frontend can't reach mock server

**Problem:** CORS or connection errors

**Solution:**
```typescript
// Update public/configs/v1/env.json
{
  "INDEXER_API_HOST": "http://localhost:4000"
}
```

## Performance

### In-Memory Mode
- Startup: < 1 second
- Response time: < 10ms
- Memory: ~50MB
- No external dependencies

### Database Mode
- Startup: ~2-3 seconds
- Response time: 20-50ms
- Memory: ~100MB
- Requires: Docker + PostgreSQL

## Testing

### Unit Tests

```bash
# Test providers
pnpm test providers

# Test mock server
pnpm test mock-server
```

### Integration Tests

```bash
# Test REST endpoints
pnpm test:integration

# Test GraphQL
pnpm test:graphql
```

### E2E with Frontend

```bash
# 1. Start mock server
pnpm --filter indexer dev

# 2. In another terminal, start frontend
pnpm dev

# 3. Navigate to http://localhost:5173
```

## Next Steps

1. **For Frontend Developers**: See [`docs/usage-examples.md`](./docs/usage-examples.md) for code examples
2. **For Backend Developers**: See [`docs/mock-data-map.md`](./docs/mock-data-map.md) for endpoint details
3. **For Testing**: See [`fixtures/`](./fixtures/) for test data definitions

## Contributing

When adding new mock data:

1. Update the appropriate fixture file
2. Add tests for new endpoints
3. Update documentation
4. Ensure data is deterministic
5. Add edge cases

## Support

For questions or issues:
- Check documentation in `mocks/docs/`
- Review story requirements in `story-requirements-analysis.md`
- Check existing issues in the repository


# Database Mock Provider Implementation Status

## Overview

The database mock provider is being implemented to allow developers to use persistent PostgreSQL-backed mock data instead of in-memory mocks.

## Progress Summary

### ✅ Completed (Tasks 1-5)

1. **TypeORM DataSource Configuration** 
   - PostgreSQL connection with retry logic
   - Entity repositories initialized
   - Async provider factory

2. **Seed Data Generators**
   - Markets: 4 perpetual markets (BTC, ETH, SOL, FUEL)
   - Accounts: 4 test accounts with various roles
   - Positions: Open/closed positions with realistic P&L
   - Trades: Historical trade data
   - Deterministic seeded random for consistency

3. **Seed Scripts**
   - Individual seed scripts for each entity type
   - Master `seed-all` script
   - Clean database script
   - All executable with `pnpm` commands

4. **NPM Scripts**
   ```bash
   pnpm seed:all      # Seed everything
   pnpm seed:reset    # Clean + seed
   pnpm seed:clean    # Clean database
   pnpm seed:markets  # Seed markets only
   pnpm seed:accounts # Seed accounts only
   pnpm seed:positions # Seed positions only
   pnpm seed:trades   # Seed trades only
   ```

### 🔨 In Progress (Task 4)

**DatabaseMockProvider Query Implementation**

The DatabaseMockProvider has stubs for all methods but needs real TypeORM queries. Key methods to implement:

#### High Priority (Core Functionality)
- [ ] `getPerpetualMarkets()` - Get all markets
- [ ] `getSubaccount()` - Get subaccount with positions
- [ ] `getParentSubaccount()` - Get parent subaccount summary
- [ ] `getPerpetualPositions()` - Get positions for account
- [ ] `getAssetPositions()` - Get asset positions
- [ ] `getPerpetualMarketTrades()` - Get recent trades
- [ ] `getPerpetualMarketOrderbook()` - Get orderbook (mock generation)
- [ ] `getPerpetualMarketCandles()` - Get OHLCV candles (mock generation)

#### Medium Priority (Trading Features)
- [ ] `getSubaccountOrders()` - Get open orders
- [ ] `getParentSubaccountOrders()` - Get parent orders
- [ ] `getSubaccountFills()` - Get fill history
- [ ] `getParentSubaccountFills()` - Get parent fills
- [ ] `getSubaccountTransfers()` - Get transfer history
- [ ] `getParentSubaccountTransfers()` - Get parent transfers

#### Low Priority (Historical Data)
- [ ] `getSubaccountHistoricalPnl()` - Get P&L history
- [ ] `getParentHistoricalPnl()` - Get parent P&L
- [ ] `getSubaccountFundingPayments()` - Get funding payments
- [ ] `getParentSubaccountFundingPayments()` - Get parent funding
- [ ] `getHistoricalTradingRewards()` - Get trading rewards
- [ ] `getPerpetualMarketHistoricalFunding()` - Get funding history

#### Optional (Advanced Features)
- [ ] `getAddressOverview()` - Get address overview
- [ ] `getTransfersBetween()` - Get transfers between accounts
- [ ] `getMegavaultHistoricalPnl()` - Get megavault P&L
- [ ] `getMegavaultPositions()` - Get megavault positions
- [ ] `getVaultHistoricalPnl()` - Get vault P&L
- [ ] `screenAddress()` - Compliance screening
- [ ] `complianceScreen()` - Compliance v2

### ⏳ Remaining (Tasks 6-7)

6. **Testing** - Test database provider with frontend
7. **Documentation** - Update docs with database mode instructions

## Usage

### Setup

1. **Start PostgreSQL:**
   ```bash
   cd apps/indexer
   docker-compose up -d
   ```

2. **Seed Database:**
   ```bash
   pnpm seed:reset
   ```

3. **Start Mock Server:**
   ```bash
   MOCK_DATA_SOURCE=database pnpm dev
   ```

### Environment Variables

```bash
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=starboard_indexer
DB_USER=postgres
DB_PASS=postgres

# Provider selection
MOCK_DATA_SOURCE=database  # or 'memory' (default)
```

## Files Created/Modified

### New Files (21)
```
apps/indexer/
├── src/
│   ├── db/
│   │   └── data-source.ts          # TypeORM configuration
│   ├── seeds/
│   │   ├── generators/
│   │   │   ├── market-generator.ts
│   │   │   ├── account-generator.ts
│   │   │   ├── position-generator.ts
│   │   │   ├── trade-generator.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── random.ts
│   │   ├── seed-markets.ts
│   │   ├── seed-accounts.ts
│   │   ├── seed-positions.ts
│   │   ├── seed-trades.ts
│   │   ├── seed-all.ts
│   │   └── clean-db.ts
│   └── providers/
│       └── DatabaseMockProvider.ts  # (modified, added init logic)
└── DATABASE_IMPLEMENTATION_STATUS.md (this file)
```

### Modified Files (4)
```
apps/indexer/
├── package.json                   # Added seed scripts
├── mock-server.ts                 # Async provider init
└── src/providers/
    └── index.ts                   # Async factory
```

## Next Steps

1. Implement DatabaseMockProvider queries (Task 4)
2. Test with frontend (Task 6)
3. Update documentation (Task 7)

## Notes

- Database mode is optional; in-memory mode remains the default and recommended approach
- Database mode is useful for:
  - Testing with persistent data between restarts
  - Debugging complex data scenarios
  - Seeding realistic test datasets
- The seed data generators use deterministic seeding for consistency





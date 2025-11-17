# Testing Database Mock Provider

## Testing Checklist

Follow these steps to verify the database mock provider infrastructure:

### Step 1: Start PostgreSQL

```bash
cd apps/indexer
docker-compose up -d
```

**Expected Output:**
```
✓ Container started
```

**Verify:**
```bash
docker-compose ps
```

Should show `db` service running on port 5432.

---

### Step 2: Test Seed Scripts

#### 2.1 Seed Markets

```bash
pnpm seed:markets
```

**Expected Output:**
```
[Seed] Starting market seeding...
[DB] Attempting to connect to PostgreSQL...
[DB] ✓ Connected to PostgreSQL successfully
[Seed] Generated 4 markets
[Seed] Cleared existing markets
[Seed] ✓ Inserted 4 markets
  - ETH-USD (ETH-USD)
  - BTC-USD (BTC-USD)
  - SOL-USD (SOL-USD)
  - FUEL-USD (FUEL-USD)
[Seed] ✓ Market seeding complete
```

#### 2.2 Seed Accounts

```bash
pnpm seed:accounts
```

**Expected Output:**
```
[Seed] Starting account seeding...
[Seed] Generated 4 accounts
[Seed] ✓ Inserted 4 accounts
  - 0x1111111111111111111111111111111111111111 (sub: 0)
  - 0x2222222222222222222222222222222222222222 (sub: 0)
  - 0x3333333333333333333333333333333333333333 (sub: 0)
  - 0x4444444444444444444444444444444444444444 (sub: 0)
```

#### 2.3 Seed Positions

```bash
pnpm seed:positions
```

**Expected Output:**
```
[Seed] Starting position seeding...
[Seed] Found 4 accounts and 4 markets
[Seed] Generated X positions
[Seed] ✓ Inserted X positions
  - Open: X
  - Closed: X
```

#### 2.4 Seed Trades

```bash
pnpm seed:trades
```

**Expected Output:**
```
[Seed] Starting trade seeding...
[Seed] Found 4 markets
[Seed] Generated 200 trades
[Seed] ✓ Inserted 200 trades
  - ETH-USD: 50 trades
  - BTC-USD: 50 trades
  - SOL-USD: 50 trades
  - FUEL-USD: 50 trades
```

#### 2.5 Seed Everything (Master Script)

```bash
pnpm seed:reset
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║  Starboard Indexer Database Seeding   ║
╚════════════════════════════════════════╝

[Clean] Starting database cleanup...
[Clean] ✓ Database cleanup complete

[Seed] Starting market seeding...
[Seed] ✓ Market seeding complete

[Seed] Starting account seeding...
[Seed] ✓ Account seeding complete

[Seed] Starting position seeding...
[Seed] ✓ Position seeding complete

[Seed] Starting trade seeding...
[Seed] ✓ Trade seeding complete

╔════════════════════════════════════════╗
║  ✓ All seeding complete!              ║
╚════════════════════════════════════════╝

You can now start the mock server in database mode:
  MOCK_DATA_SOURCE=database pnpm dev
```

---

### Step 3: Verify Data in PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it indexer-db-1 psql -U postgres -d starboard_indexer

# Check tables
\dt

# Count records
SELECT COUNT(*) FROM market;     -- Should be 4
SELECT COUNT(*) FROM account;    -- Should be 4
SELECT COUNT(*) FROM position;   -- Should be ~16-32
SELECT COUNT(*) FROM trade;      -- Should be 200

# View sample data
SELECT id, ticker, status FROM market;
SELECT id, address FROM account LIMIT 5;
SELECT id, ticker, status, side FROM position LIMIT 10;
SELECT id, side, price FROM trade LIMIT 10;

# Exit
\q
```

---

### Step 4: Test Mock Server Startup (In-Memory Mode)

First verify in-memory mode still works:

```bash
cd apps/indexer
pnpm dev
```

**Expected Output:**
```
[MockDataProvider] Using in-memory mock data provider (fast, stateless)
[mock-indexer] REST + GraphQL ready at http://0.0.0.0:4000
[mock-indexer] GraphQL endpoint available at /graphql
[mock-indexer] WebSocket server ready at ws://0.0.0.0:4001
```

**Test REST endpoint:**
```bash
curl http://localhost:4000/v4/perpetualMarkets
```

Should return JSON with 4 markets.

Press Ctrl+C to stop.

---

### Step 5: Test Mock Server Startup (Database Mode)

```bash
MOCK_DATA_SOURCE=database pnpm dev
```

**Expected Output:**
```
[MockDataProvider] Using database-backed mock data provider
[DatabaseMockProvider] Initializing database connection...
[DB] Attempting to connect to PostgreSQL (attempt 1/5)...
[DB] ✓ Connected to PostgreSQL successfully
  Host: localhost
  Database: starboard_indexer
  Port: 5432
[DatabaseMockProvider] ✓ Database provider ready
[mock-indexer] REST + GraphQL ready at http://0.0.0.0:4000
[mock-indexer] GraphQL endpoint available at /graphql
[mock-indexer] WebSocket server ready at ws://0.0.0.0:4001
```

**Note:** At this stage, the server starts successfully but API endpoints will return empty data because the query methods are not yet implemented.

**Test (will return empty):**
```bash
curl http://localhost:4000/v4/perpetualMarkets
```

Expected: `{"markets":{}}`

This is normal - the database has data, but DatabaseMockProvider queries aren't implemented yet.

---

### Step 6: Clean Database

```bash
pnpm seed:clean
```

**Expected Output:**
```
[Clean] Starting database cleanup...
[Clean] Clearing payments...
[Clean] Clearing trades...
[Clean] Clearing positions...
[Clean] Clearing accounts...
[Clean] Clearing markets...
[Clean] ✓ Database cleanup complete
```

---

## Troubleshooting

### Issue: "Failed to connect to database"

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   docker-compose ps
   ```
2. Check logs:
   ```bash
   docker-compose logs db
   ```
3. Restart PostgreSQL:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Issue: "No accounts found. Please run seed-accounts first."

**Solution:** Run seeds in order:
```bash
pnpm seed:markets
pnpm seed:accounts
pnpm seed:positions
pmpm seed:trades
```

Or use master script:
```bash
pnpm seed:reset
```

### Issue: "Port 5432 already in use"

**Solution:** Change port in `docker-compose.yml` or stop conflicting service:
```bash
lsof -i :5432  # Find process
kill -9 <PID>  # Stop it
```

### Issue: TypeScript compilation errors

**Solution:** Rebuild:
```bash
pnpm build
```

---

## Success Criteria

- [ ] PostgreSQL starts without errors
- [ ] All seed scripts execute successfully
- [ ] Data appears in PostgreSQL (verified with psql)
- [ ] Mock server starts in memory mode
- [ ] Mock server starts in database mode (even if returning empty data)
- [ ] No linter errors
- [ ] Clean script removes all data

---

## Next Steps After Testing

If all tests pass:
1. Implement DatabaseMockProvider queries (db-4)
2. Test queries return correct data
3. Test with frontend (db-6)
4. Update documentation (db-7)

If tests fail:
1. Review error messages
2. Fix issues in seed scripts or data-source.ts
3. Re-test





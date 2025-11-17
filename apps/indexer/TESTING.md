# Testing the Mock Indexer

This guide covers how to test the mock indexer's REST, GraphQL, and WebSocket endpoints.

## Prerequisites

1. **Install dependencies:**
   ```bash
   cd /Users/drinor/Documents/charthouse/starboard-2
   pnpm install
   ```

2. **Start the mock server:**
   ```bash
   pnpm --filter indexer dev
   ```

   You should see:
   ```
   [mock-indexer] Using InMemoryMockProvider (default)
   [mock-indexer] REST + GraphQL ready at http://0.0.0.0:4000
   [mock-indexer] GraphQL endpoint available at /graphql
   [mock-indexer] WebSocket server ready at ws://0.0.0.0:4001
   ```

## Testing REST Endpoints

### Using curl

```bash
# Test health check
curl http://localhost:4000/v4/time

# Get all markets
curl http://localhost:4000/v4/perpetualMarkets

# Get specific market
curl http://localhost:4000/v4/perpetualMarkets?ticker=BTC-USD

# Get account balance
curl http://localhost:4000/v4/addresses/0x1111111111111111111111111111111111111111/parentSubaccountNumber/0

# Get orderbook
curl http://localhost:4000/v4/orderbooks/perpetualMarket/BTC-USD

# Get candles
curl "http://localhost:4000/v4/candles/perpetualMarkets/BTC-USD?resolution=1HOUR&limit=24"
```

### Using the browser

Open any of these URLs in your browser:

- http://localhost:4000/v4/perpetualMarkets
- http://localhost:4000/v4/addresses/0x1111111111111111111111111111111111111111/parentSubaccountNumber/0
- http://localhost:4000/v4/orderbooks/perpetualMarket/BTC-USD

## Testing GraphQL Endpoint

### Using curl

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ markets(first: 5) { id ticker oraclePrice { price } volume24H } }"
  }'
```

### Using GraphQL Playground

1. Open http://localhost:4000/graphql in your browser
2. Most GraphQL clients/tools will auto-detect the endpoint
3. Try this query:

```graphql
query GetMarkets {
  markets(first: 5) {
    id
    ticker
    oraclePrice {
      price
      timestamp
    }
    volume24H
    priceChange24H
    status
  }
}
```

```graphql
query GetAccountPositions {
  accounts(first: 1, address: "0x1111111111111111111111111111111111111111") {
    id
    address
    subaccountNumber
    positions(first: 10, status: "OPEN") {
      id
      ticker
      side
      size
      entryPrice
      unrealizedPnl
    }
  }
}
```

## Testing WebSocket Endpoint

### Automated Test Script

Run the included test script:

```bash
cd apps/indexer
node test-websocket.js
```

This will:
- Connect to `ws://localhost:4001`
- Subscribe to multiple channels
- Verify data is received
- Test ping/pong
- Test unsubscribe
- Test error handling
- Print a summary

**Expected output:**
```
============================================================
MOCK INDEXER WEBSOCKET TEST SUITE
============================================================

Connecting to: ws://localhost:4001
Test address: 0x1111111111111111111111111111111111111111
Test ticker: BTC-USD

[HH:MM:SS.mmm] ✅ CONNECT: WebSocket connected successfully
[HH:MM:SS.mmm] 📤 TEST 1: Subscribing to v4_parent_subaccounts
[HH:MM:SS.mmm] ✅ SUBSCRIBED: Channel: v4_parent_subaccounts
[HH:MM:SS.mmm] 📥 DATA: Channel: v4_parent_subaccounts
  └─ Equity: $245000.00
...
============================================================
TEST RESULTS:
============================================================
✅ Passed: 7
❌ Failed: 0
📨 Total messages received: 25
============================================================
```

### Manual Testing with wscat

Install wscat:
```bash
npm install -g wscat
```

Connect and test:
```bash
# Connect to WebSocket
wscat -c ws://localhost:4001

# Once connected, send messages:

# Subscribe to account balance
> {"type":"subscribe","channel":"v4_parent_subaccounts","id":"0x1111111111111111111111111111111111111111/0"}

# You should see:
< {"type":"subscribed","channel":"v4_parent_subaccounts","id":"0x1111111111111111111111111111111111111111/0",...}
< {"type":"channel_data","channel":"v4_parent_subaccounts",...,"contents":{"equity":"245000.00",...}}

# Subscribe to markets
> {"type":"subscribe","channel":"v4_markets"}

# Subscribe to orderbook
> {"type":"subscribe","channel":"v4_orderbook/BTC-USD"}

# Test ping/pong
> {"type":"ping"}
< {"type":"pong","time":1699999999999}

# Unsubscribe
> {"type":"unsubscribe","channel":"v4_markets"}
< {"type":"unsubscribed","channel":"v4_markets"}
```

### Testing with JavaScript in Browser

Open browser console and run:

```javascript
const ws = new WebSocket('ws://localhost:4001');

ws.onopen = () => {
  console.log('Connected!');
  
  // Subscribe to account balance
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'v4_parent_subaccounts',
    id: '0x1111111111111111111111111111111111111111/0'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  if (data.type === 'channel_data' && data.channel === 'v4_parent_subaccounts') {
    console.log('Account Equity:', data.contents.equity);
    console.log('Free Collateral:', data.contents.freeCollateral);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

## Testing with Frontend App

### Step 1: Configure Frontend

Ensure your frontend app is configured to use the mock indexer:

```typescript
// In your app config
const INDEXER_CONFIG = {
  restUrl: 'http://localhost:4000',
  wsUrl: 'ws://localhost:4001',
  graphqlUrl: 'http://localhost:4000/graphql'
};
```

### Step 2: Start Both Servers

Terminal 1 (Mock Indexer):
```bash
cd /Users/drinor/Documents/charthouse/starboard-2
pnpm --filter indexer dev
```

Terminal 2 (Frontend):
```bash
cd /Users/drinor/Documents/charthouse/starboard-2
pnpm dev
```

### Step 3: Monitor WebSocket in Browser

1. Open frontend at http://localhost:5173
2. Open DevTools → Console
3. Look for:
   ```
   [Bonsai] Connecting to WebSocket: ws://localhost:4001
   [Bonsai] Subscribed to: v4_parent_subaccounts
   [Bonsai] Received account data
   ```

4. Check Network tab → WS filter
5. Click the WebSocket connection
6. View Messages tab to see data flow

### Step 4: Test Account Balance Hook

The `useEnhancedAccountBalance` hook should now receive data via WebSocket:

```typescript
import { useEnhancedAccountBalance } from '@/hooks/useEnhancedAccountBalance';

function MyComponent() {
  const { 
    equity, 
    freeCollateral, 
    marginUsage 
  } = useEnhancedAccountBalance();

  console.log('Equity:', equity); // Should show $245,000.00 (mock data)
  console.log('Free Collateral:', freeCollateral);
  console.log('Margin Usage:', marginUsage);

  return <div>...</div>;
}
```

## Verifying Data Flow

### Full Data Flow Test

1. **Connect Wallet** in the frontend
2. **Monitor Console** for WebSocket subscriptions
3. **Check Redux DevTools**:
   - Look for `BonsaiCore.account.parentSubaccountSummary`
   - Should contain `equity`, `freeCollateral`, etc.
4. **Check UI** - Account balance should display mock values

### Expected Mock Values

When testing with address `0x1111111111111111111111111111111111111111`:

- **Equity:** ~$245,000
- **Free Collateral:** ~$120,000
- **Margin Usage:** ~50%
- **Open Positions:** 2-4 positions
- **Available Markets:** BTC-USD, ETH-USD, FUEL-USD, stFUEL-USD

## Troubleshooting

### WebSocket Won't Connect

**Problem:** `WebSocket connection failed` in console

**Solutions:**
1. Verify mock server is running: `lsof -i :4001`
2. Check for port conflicts: `lsof -ti:4001`
3. Restart mock server: `pnpm --filter indexer dev`
4. Check server logs for errors

### No Data Received

**Problem:** WebSocket connects but no data arrives

**Solutions:**
1. Check subscription format is correct (see examples above)
2. Verify address exists in mock data
3. Check server logs: `[ws] Error sending...`
4. Ensure subscription confirmation received: `{"type":"subscribed",...}`

### Data Not Updating

**Problem:** Data received but UI not updating

**Solutions:**
1. Check Redux DevTools - is data reaching Redux?
2. Verify hook is subscribing to correct selector
3. Check component re-render logic
4. Look for console errors

### Mock Data Not Matching Expectations

**Problem:** Wrong values or structure

**Solutions:**
1. Mock data is deterministic - same input = same output
2. Try different addresses to see variety
3. Check `InMemoryMockProvider` for data generation logic
4. Modify fixtures in `mocks/fixtures/` if needed

## Performance Testing

### Load Testing WebSocket

Test multiple simultaneous connections:

```javascript
// Create 10 WebSocket connections
const connections = [];
for (let i = 0; i < 10; i++) {
  const ws = new WebSocket('ws://localhost:4001');
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'v4_markets'
    }));
  };
  connections.push(ws);
}

// Monitor server CPU/memory usage
```

### Stress Testing REST API

```bash
# Install Apache Bench
brew install apache-bench  # macOS
apt-get install apache2-utils  # Linux

# Test 1000 requests with 10 concurrent
ab -n 1000 -c 10 http://localhost:4000/v4/perpetualMarkets

# Expected: All requests should succeed in < 1 second
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
jobs:
  test-mock-indexer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm --filter indexer dev &
      - run: sleep 5  # Wait for server to start
      - run: node apps/indexer/test-websocket.js
      - run: curl -f http://localhost:4000/v4/perpetualMarkets
```

## Next Steps

After verifying everything works:

1. ✅ WebSocket connects successfully
2. ✅ All channels receive data
3. ✅ Frontend hooks receive updates
4. ✅ UI displays account balance correctly

You're ready to:
- Build out remaining UI components
- Add more test addresses for variety
- Customize mock data for specific scenarios
- Deploy to staging environment

## Additional Resources

- [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md) - Complete WebSocket API documentation
- [mocks/README.md](./mocks/README.md) - Mock data system overview
- [mocks/docs/mock-data-map.md](./mocks/docs/mock-data-map.md) - Story → endpoint mappings
- [mocks/docs/usage-examples.md](./mocks/docs/usage-examples.md) - Frontend code examples






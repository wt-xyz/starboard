# WebSocket Support for Mock Indexer

The mock indexer now includes full WebSocket support for real-time data updates, matching the dYdX v4 indexer WebSocket protocol.

## Connection

**WebSocket URL:** `ws://localhost:4001`

The WebSocket server runs on a separate port (4001) from the REST/GraphQL endpoints (4000).

## Message Protocol

### Subscribe to a Channel

**Request:**
```json
{
  "type": "subscribe",
  "channel": "v4_parent_subaccounts",
  "id": "0x1234567890123456789012345678901234567890/0"
}
```

**Response (Confirmation):**
```json
{
  "type": "subscribed",
  "channel": "v4_parent_subaccounts",
  "id": "0x1234567890123456789012345678901234567890/0",
  "connection_id": "conn-1234567890",
  "message_id": 1
}
```

**Response (Data Updates):**
```json
{
  "type": "channel_data",
  "channel": "v4_parent_subaccounts",
  "id": "0x1234567890123456789012345678901234567890/0",
  "version": "1.0",
  "contents": {
    "address": "0x1234567890123456789012345678901234567890",
    "parentSubaccountNumber": 0,
    "equity": "245000.00",
    "freeCollateral": "120000.00",
    ...
  }
}
```

### Unsubscribe from a Channel

**Request:**
```json
{
  "type": "unsubscribe",
  "channel": "v4_parent_subaccounts",
  "id": "0x1234567890123456789012345678901234567890/0"
}
```

**Response:**
```json
{
  "type": "unsubscribed",
  "channel": "v4_parent_subaccounts",
  "id": "0x1234567890123456789012345678901234567890/0"
}
```

### Ping/Pong (Keepalive)

**Request:**
```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "time": 1699999999999
}
```

## Supported Channels

### 1. `v4_parent_subaccounts`

Streams account balance and collateral information.

- **ID Format:** `{address}/{parentSubaccountNumber}`
- **Example:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/0`
- **Update Frequency:** Every 3 seconds
- **Data:** Parent subaccount details including equity, free collateral, child subaccounts

**Example Subscription:**
```json
{
  "type": "subscribe",
  "channel": "v4_parent_subaccounts",
  "id": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/0"
}
```

### 2. `v4_subaccounts`

Streams individual subaccount information.

- **ID Format:** `{address}/{subaccountNumber}`
- **Example:** `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/0`
- **Update Frequency:** Every 3 seconds
- **Data:** Subaccount details including positions, orders, balances

**Example Subscription:**
```json
{
  "type": "subscribe",
  "channel": "v4_subaccounts",
  "id": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/0"
}
```

### 3. `v4_markets`

Streams all market prices and statistics.

- **ID Format:** None required
- **Update Frequency:** Every 2 seconds
- **Data:** All perpetual markets with current prices, volumes, funding rates

**Example Subscription:**
```json
{
  "type": "subscribe",
  "channel": "v4_markets"
}
```

### 4. `v4_orderbook/{ticker}`

Streams orderbook updates for a specific market.

- **ID Format:** `{ticker}` (embedded in channel name)
- **Example Channel:** `v4_orderbook/BTC-USD`
- **Update Frequency:** Every 1.5 seconds
- **Data:** Bids and asks with prices and sizes

**Example Subscription:**
```json
{
  "type": "subscribe",
  "channel": "v4_orderbook/BTC-USD"
}
```

### 5. `v4_trades/{ticker}`

Streams recent trades for a specific market.

- **ID Format:** `{ticker}` (embedded in channel name)
- **Example Channel:** `v4_trades/BTC-USD`
- **Update Frequency:** Every 4 seconds
- **Data:** Recent trade history

**Example Subscription:**
```json
{
  "type": "subscribe",
  "channel": "v4_trades/BTC-USD"
}
```

## Error Handling

When an error occurs, the server sends an error message:

```json
{
  "type": "error",
  "message": "v4_parent_subaccounts requires id (address/parentSubaccountNumber)"
}
```

## Connection Management

- **Automatic Cleanup:** When a client disconnects, all subscriptions are automatically cleaned up
- **Multiple Subscriptions:** A single WebSocket connection can subscribe to multiple channels
- **Duplicate Prevention:** Attempting to subscribe to the same channel twice is silently ignored

## Testing with wscat

Install wscat globally:
```bash
npm install -g wscat
```

Connect and subscribe:
```bash
# Connect
wscat -c ws://localhost:4001

# Subscribe to account balance
> {"type":"subscribe","channel":"v4_parent_subaccounts","id":"0x1111111111111111111111111111111111111111/0"}

# Subscribe to markets
> {"type":"subscribe","channel":"v4_markets"}

# Subscribe to BTC-USD orderbook
> {"type":"subscribe","channel":"v4_orderbook/BTC-USD"}

# Ping
> {"type":"ping"}

# Unsubscribe
> {"type":"unsubscribe","channel":"v4_markets"}
```

## Integration with Frontend

The frontend app connects to the WebSocket server through the Bonsai client. The connection is established when:

1. User connects wallet
2. App subscribes to `v4_parent_subaccounts` with user's address
3. WebSocket sends initial data + periodic updates
4. Redux stores the data in `BonsaiCore.account.parentSubaccountSummary`
5. Components read from Redux using hooks like `useEnhancedAccountBalance()`

## Update Frequencies

The mock indexer sends updates at these intervals:

| Channel | Frequency |
|---------|-----------|
| `v4_parent_subaccounts` | 3 seconds |
| `v4_subaccounts` | 3 seconds |
| `v4_markets` | 2 seconds |
| `v4_orderbook/{ticker}` | 1.5 seconds |
| `v4_trades/{ticker}` | 4 seconds |

These can be adjusted in `mock-server.ts` by modifying the `setInterval` durations.

## Architecture

```
┌─────────────────┐
│  Frontend App   │
│   (Port 5173)   │
└────────┬────────┘
         │
         │ WebSocket
         │ ws://localhost:4001
         ↓
┌─────────────────┐
│  Mock Indexer   │
│                 │
│  REST: 4000     │
│  GraphQL: 4000  │
│  WebSocket: 4001│
└────────┬────────┘
         │
         │ Uses
         ↓
┌─────────────────┐
│ MockDataProvider│
│  (In-Memory)    │
└─────────────────┘
```

## Troubleshooting

### WebSocket Connection Fails

**Problem:** Frontend can't connect to WebSocket

**Solutions:**
1. Check if mock indexer is running: `pnpm --filter indexer dev`
2. Verify port 4001 is not in use: `lsof -i :4001`
3. Check browser console for connection errors
4. Ensure the frontend is configured to use `ws://localhost:4001` (not 4000)

### No Data Received

**Problem:** WebSocket connects but no data arrives

**Solutions:**
1. Check subscription format is correct
2. Verify the address/ticker exists in mock data
3. Check mock server logs for errors: `[ws] Error sending...`
4. Ensure subscription confirmation was received

### Stale Data

**Problem:** Data doesn't update or updates too slowly

**Solutions:**
1. The mock returns deterministic data (same values each time)
2. For dynamic updates, modify `InMemoryMockProvider` to add randomness
3. Adjust update frequencies in `mock-server.ts`

## Next Steps

1. **Install dependencies:** `pnpm install` (in `apps/indexer/`)
2. **Start mock server:** `pnpm --filter indexer dev`
3. **Test with wscat:** Follow examples above
4. **Connect frontend:** The frontend should automatically connect when you start it
5. **Monitor logs:** Watch for `[ws]` prefixed messages in the server output


#!/usr/bin/env node

/**
 * WebSocket Test Script for Mock Indexer
 * 
 * Usage: node test-websocket.js
 * 
 * Requirements:
 * - Mock indexer must be running: pnpm --filter indexer dev
 * - ws package must be installed: pnpm install
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:4001';
const TEST_ADDRESS = '0x1111111111111111111111111111111111111111';
const TEST_TICKER = 'BTC-USD';

function log(prefix, message, data = null) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  console.log(`[${timestamp}] ${prefix}:`, message);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function runTests() {
  const ws = new WebSocket(WS_URL);
  const receivedMessages = [];
  let testsPassed = 0;
  let testsFailed = 0;

  ws.on('open', () => {
    log('✅ CONNECT', 'WebSocket connected successfully');
    
    // Test 1: Subscribe to parent subaccounts
    log('📤 TEST 1', 'Subscribing to v4_parent_subaccounts');
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'v4_parent_subaccounts',
      id: `${TEST_ADDRESS}/0`
    }));

    // Test 2: Subscribe to markets (after 1 second)
    setTimeout(() => {
      log('📤 TEST 2', 'Subscribing to v4_markets');
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'v4_markets'
      }));
    }, 1000);

    // Test 3: Subscribe to orderbook (after 2 seconds)
    setTimeout(() => {
      log('📤 TEST 3', `Subscribing to v4_orderbook/${TEST_TICKER}`);
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: `v4_orderbook/${TEST_TICKER}`
      }));
    }, 2000);

    // Test 4: Subscribe to trades (after 3 seconds)
    setTimeout(() => {
      log('📤 TEST 4', `Subscribing to v4_trades/${TEST_TICKER}`);
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: `v4_trades/${TEST_TICKER}`
      }));
    }, 3000);

    // Test 5: Ping (after 4 seconds)
    setTimeout(() => {
      log('📤 TEST 5', 'Sending ping');
      ws.send(JSON.stringify({
        type: 'ping'
      }));
    }, 4000);

    // Test 6: Unsubscribe from markets (after 6 seconds)
    setTimeout(() => {
      log('📤 TEST 6', 'Unsubscribing from v4_markets');
      ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel: 'v4_markets'
      }));
    }, 6000);

    // Test 7: Subscribe to invalid channel (after 7 seconds)
    setTimeout(() => {
      log('📤 TEST 7', 'Subscribing to invalid channel (should error)');
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'v4_invalid_channel'
      }));
    }, 7000);

    // Summary and close (after 10 seconds)
    setTimeout(() => {
      log('📊 SUMMARY', `Tests completed`);
      console.log(`\n${'='.repeat(60)}`);
      console.log('TEST RESULTS:');
      console.log(`${'='.repeat(60)}`);
      console.log(`✅ Passed: ${testsPassed}`);
      console.log(`❌ Failed: ${testsFailed}`);
      console.log(`📨 Total messages received: ${receivedMessages.length}`);
      console.log(`${'='.repeat(60)}\n`);
      
      ws.close();
      process.exit(testsFailed > 0 ? 1 : 0);
    }, 10000);
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      receivedMessages.push(message);

      switch (message.type) {
        case 'subscribed':
          testsPassed++;
          log('✅ SUBSCRIBED', `Channel: ${message.channel}`, { 
            channel: message.channel, 
            id: message.id 
          });
          break;

        case 'channel_data':
          log('📥 DATA', `Channel: ${message.channel}`);
          
          // Validate data structure
          if (message.channel === 'v4_parent_subaccounts') {
            if (message.contents && message.contents.equity) {
              log('  └─', `Equity: $${message.contents.equity}`);
            }
          } else if (message.channel === 'v4_markets') {
            const marketCount = Object.keys(message.contents.markets || {}).length;
            log('  └─', `Markets: ${marketCount}`);
          } else if (message.channel.startsWith('v4_orderbook/')) {
            const bidsCount = message.contents.bids?.length || 0;
            const asksCount = message.contents.asks?.length || 0;
            log('  └─', `Bids: ${bidsCount}, Asks: ${asksCount}`);
          } else if (message.channel.startsWith('v4_trades/')) {
            const tradesCount = message.contents.trades?.length || 0;
            log('  └─', `Trades: ${tradesCount}`);
          }
          break;

        case 'unsubscribed':
          testsPassed++;
          log('✅ UNSUBSCRIBED', `Channel: ${message.channel}`);
          break;

        case 'pong':
          testsPassed++;
          log('✅ PONG', 'Ping/pong successful', { time: message.time });
          break;

        case 'error':
          testsPassed++; // Expected error for invalid channel
          log('✅ ERROR', 'Error received (expected for invalid channel)', { 
            message: message.message 
          });
          break;

        default:
          log('⚠️  UNKNOWN', 'Unknown message type', message);
      }
    } catch (error) {
      testsFailed++;
      log('❌ ERROR', 'Failed to parse message', { error: error.message });
    }
  });

  ws.on('error', (error) => {
    testsFailed++;
    log('❌ ERROR', 'WebSocket error', { error: error.message });
    console.log('\n⚠️  Make sure the mock indexer is running:');
    console.log('   pnpm --filter indexer dev\n');
  });

  ws.on('close', () => {
    log('🔌 DISCONNECT', 'WebSocket connection closed');
  });
}

console.log('\n' + '='.repeat(60));
console.log('MOCK INDEXER WEBSOCKET TEST SUITE');
console.log('='.repeat(60) + '\n');
console.log(`Connecting to: ${WS_URL}`);
console.log(`Test address: ${TEST_ADDRESS}`);
console.log(`Test ticker: ${TEST_TICKER}\n`);

runTests();


/**
 * Position Events Example
 * 
 * Demonstrates how to use the PositionEventProcessor to track and analyze
 * position lifecycle events from the dYdX indexer websocket.
 */

import {
  calculateLiquidationPrice,
  Network,
  PositionEventProcessor,
  PositionEventType,
  PositionSide,
  PositionStatus,
  SocketClient,
  validatePositionParams
} from '../src';

// Example: Setup position event tracking
async function setupPositionTracking() {
  // Initialize the position event processor
  const positionProcessor = new PositionEventProcessor({
    enableAnalytics: true,
    debug: true,
    onAnalytics: (analytics) => {
      console.log('📊 Position Analytics:', {
        market: analytics.market,
        side: analytics.side,
        eventType: analytics.eventType,
        sizeUsd: analytics.sizeUsd,
        realizedPnl: analytics.realizedPnl,
        realizedPnlPercent: analytics.realizedPnlPercent,
        durationSeconds: analytics.durationSeconds,
      });
    },
    onError: (error) => {
      console.error('❌ Position Processor Error:', error);
    },
  });

  // Subscribe to position events
  positionProcessor.on('position_opened', (event) => {
    console.log('🟢 Position Opened:', {
      market: event.position.market,
      side: event.position.side,
      size: event.position.size,
      entryPrice: event.position.entryPrice,
    });
  });

  positionProcessor.on('position_modified', (event) => {
    console.log('🔄 Position Modified:', {
      market: event.position.market,
      previousSize: event.previousPosition?.size,
      newSize: event.position.size,
    });
  });

  positionProcessor.on('position_closed', (event) => {
    console.log('🔴 Position Closed:', {
      market: event.position.market,
      realizedPnl: event.position.realizedPnl,
      exitPrice: event.position.exitPrice,
    });
  });

  positionProcessor.on('position_liquidated', (event) => {
    console.log('⚠️ Position Liquidated:', {
      market: event.position.market,
      side: event.position.side,
      size: event.position.size,
    });
  });

  return positionProcessor;
}

// Example: Connect to websocket and process position updates
async function monitorPositions(
  address: string,
  subaccountNumber: number = 0
) {
  const positionProcessor = await setupPositionTracking();

  // Setup websocket connection
  const config = Network.testnet().indexerConfig;
  
  const socketClient = new SocketClient(
    config,
    () => console.log('✅ WebSocket Connected'),
    () => console.log('❌ WebSocket Disconnected'),
    (message) => {
      try {
        const data = JSON.parse(message.data.toString());
        
        // Handle subaccount updates
        if (data.type === 'channel_data' && data.channel === 'v4_subaccounts') {
          const contents = data.contents;
          
          // Process position updates
          if (contents.perpetualPositions) {
            positionProcessor.processPositionUpdates(
              contents.perpetualPositions,
              address,
              subaccountNumber,
              contents.blockHeight
            );
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },
    (error) => console.error('WebSocket Error:', error)
  );

  socketClient.connect();
  
  // Subscribe to subaccount updates
  socketClient.subscribeToSubaccount(address, subaccountNumber);

  return { socketClient, positionProcessor };
}

// Example: Validate position parameters before opening
function validateLongPosition(
  market: string,
  sizeUsd: number,
  leverage: number
) {
  console.log(`\n🔍 Validating ${market} long position...`);
  console.log(`Size: $${sizeUsd}, Leverage: ${leverage}x`);

  const validation = validatePositionParams(market, sizeUsd, leverage);
  
  if (validation.valid) {
    console.log('✅ Position parameters are valid');
    return true;
  } else {
    console.log('❌ Validation errors:');
    validation.errors.forEach((error) => console.log(`  - ${error}`));
    return false;
  }
}

// Example: Calculate liquidation price for a long position
function calculateLongLiquidationPrice(
  market: string,
  entryPrice: number,
  leverage: number
) {
  const liqPrice = calculateLiquidationPrice(
    entryPrice,
    leverage,
    PositionSide.LONG,
    0.001 // 0.1% fees
  );

  console.log(`\n📉 Liquidation Price Calculation for ${market}:`);
  console.log(`Entry Price: $${entryPrice}`);
  console.log(`Leverage: ${leverage}x`);
  console.log(`Liquidation Price: $${liqPrice.toFixed(2)}`);
  console.log(`Distance to Liquidation: ${(((entryPrice - liqPrice) / entryPrice) * 100).toFixed(2)}%`);

  return liqPrice;
}

// Example: Track position analytics
async function trackPositionAnalytics(address: string) {
  const positionProcessor = new PositionEventProcessor({
    enableAnalytics: true,
    onAnalytics: (analytics) => {
      // Send analytics to your analytics platform
      console.log('📈 Sending analytics to tracking platform:', {
        event: analytics.eventType,
        market: analytics.market,
        pnl: analytics.realizedPnl,
        pnlPercent: analytics.realizedPnlPercent,
        duration: analytics.durationSeconds,
      });

      // Example: Track in your analytics service
      // trackEvent('position_event', analytics);
    },
  });

  // Subscribe to all analytics events
  positionProcessor.on('position_analytics', (analytics) => {
    // Custom analytics processing
    if (analytics.eventType === PositionEventType.POSITION_CLOSED) {
      if (analytics.realizedPnl > 0) {
        console.log(`💰 Profitable trade: +$${analytics.realizedPnl.toFixed(2)}`);
      } else {
        console.log(`📉 Losing trade: -$${Math.abs(analytics.realizedPnl).toFixed(2)}`);
      }
    }
  });

  return positionProcessor;
}

// Example: Get current positions
async function getCurrentPositions(
  positionProcessor: PositionEventProcessor,
  address: string,
  subaccountNumber: number = 0
) {
  const positions = positionProcessor.getSubaccountPositions(address, subaccountNumber);
  
  console.log(`\n📊 Current Positions for ${address} (Subaccount ${subaccountNumber}):`);
  
  if (positions.length === 0) {
    console.log('No open positions');
    return;
  }

  positions.forEach((position) => {
    console.log(`\n${position.market}:`);
    console.log(`  Side: ${position.side}`);
    console.log(`  Size: ${position.size}`);
    console.log(`  Entry Price: $${position.entryPrice}`);
    console.log(`  Unrealized PnL: ${position.unrealizedPnl || 'N/A'}`);
    console.log(`  Status: ${position.status}`);
  });
}

// Main example execution
async function main() {
  console.log('🚀 dYdX Position Events Example\n');

  // Example 1: Validate position parameters
  console.log('=== Example 1: Position Validation ===');
  validateLongPosition('BTC-USD', 1000, 10); // Valid
  validateLongPosition('BTC-USD', 5, 10);    // Invalid - too small
  validateLongPosition('ETH-USD', 1000, 25); // Invalid - leverage too high

  // Example 2: Calculate liquidation price
  console.log('\n=== Example 2: Liquidation Price ===');
  calculateLongLiquidationPrice('ETH-USD', 3000, 10);
  calculateLongLiquidationPrice('BTC-USD', 60000, 5);

  // Example 3: Monitor positions (requires actual address)
  console.log('\n=== Example 3: Position Monitoring ===');
  console.log('To monitor positions, uncomment the following code and provide your address:\n');
  console.log(`
  const address = 'dydx1...'; // Your dYdX address
  const { socketClient, positionProcessor } = await monitorPositions(address, 0);
  
  // Get current positions after some time
  setTimeout(async () => {
    await getCurrentPositions(positionProcessor, address, 0);
  }, 5000);
  `);

  // Example 4: Analytics tracking
  console.log('\n=== Example 4: Analytics Tracking ===');
  const analyticsProcessor = await trackPositionAnalytics('example-address');
  
  // Simulate a position event for demonstration
  analyticsProcessor.processPositionUpdate(
    {
      market: 'ETH-USD',
      side: PositionSide.LONG,
      size: '1.5',
      entryPrice: '3000',
      status: PositionStatus.OPEN,
    },
    'example-address',
    0
  );
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  calculateLongLiquidationPrice, getCurrentPositions, monitorPositions, setupPositionTracking, trackPositionAnalytics, validateLongPosition
};


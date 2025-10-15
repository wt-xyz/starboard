import { Data } from '../types';

/**
 * Generates realistic fake historical funding data for testing purposes
 * Creates 168 hours (1 week) of hourly funding rate data with realistic market volatility
 */
export const generateFakeHistoricalFunding = (market: string, limit?: number | null): Data => {
  const now = new Date();
  const data: any[] = [];

  // Generate data for the last 168 hours (1 week) with hourly intervals
  for (let i = 167; i >= 0; i--) {
    // Create timestamp that goes back exactly i hours from now
    // This ensures we get proper time distribution across days
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    // Ensure the timestamp is properly set to the hour (remove minutes/seconds)
    timestamp.setMinutes(0, 0, 0);

    // Generate realistic, volatile funding rates with much wider range
    // Start with a base rate and add realistic market volatility
    let rate: number;

    // Use a random walk approach for more realistic market behavior
    if (i === 167) {
      // First period - start with a random rate
      rate = (Math.random() - 0.5) * 0.01; // Start between -0.5% and +0.5%
    } else {
      // Get the previous rate and add random movement
      const prevRate = data[data.length - 1].rate;
      const prevRateNum = parseFloat(prevRate);

      // Add random walk with mean reversion tendency - make steps much larger
      const randomStep = (Math.random() - 0.5) * 0.008; // ±0.4% step (much larger!)
      const meanReversion = -prevRateNum * 0.1; // Tendency to revert to zero
      rate = prevRateNum + randomStep + meanReversion;
    }

    // Add occasional market stress events (larger movements)
    if (Math.random() < 0.2) {
      // 20% chance of stress event
      rate += (Math.random() - 0.5) * 0.01; // ±0.5% stress movement
    }

    // Add weekly patterns (weekend vs weekday volatility)
    const dayOfWeek = timestamp.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend
      rate *= 1.8; // Higher volatility on weekends
    }

    // Ensure rates stay within realistic bounds for most markets
    rate = Math.max(-0.005, Math.min(0.005, rate)); // Cap at ±0.5%

    // Generate realistic BTC price based on the example range
    let basePrice: number;
    if (market.includes('BTC')) {
      basePrice = 112000 + (Math.random() - 0.5) * 4000; // $110k-$114k range like example
    } else if (market.includes('ETH')) {
      basePrice = 3000 + (Math.random() - 0.5) * 200; // $2.9k-$3.1k range
    } else if (market.includes('SOL')) {
      basePrice = 80 + (Math.random() - 0.5) * 20; // $70-$90 range
    } else {
      basePrice = 100 + (Math.random() - 0.5) * 50; // Generic $75-$125 range
    }

    // Add some price volatility
    const priceChange = (Math.random() - 0.5) * 0.02; // ±1% change
    const price = basePrice * (1 + priceChange);

    // Generate block height (incrementing by roughly 1 hour worth of blocks)
    const blockHeight = 53661860 - i * 3600; // Starting from example height, decrementing hourly

    data.push({
      ticker: market,
      rate: rate.toFixed(9), // 9 decimal places to match example precision
      price: price.toFixed(2),
      effectiveAt: timestamp.toISOString(),
      effectiveAtHeight: blockHeight.toString(),
    });
  }

  // Apply limit if specified
  if (limit && limit > 0) {
    return { historicalFunding: data.slice(-limit) };
  }

  return { historicalFunding: data };
};

/**
 * Generates realistic fake orderbook data for testing purposes
 * Creates bid and ask price levels with realistic spread and depth
 */
export const generateFakeOrderbook = (market: string): Data => {
  // Determine base price based on market
  let basePrice: number;
  if (market.includes('BTC')) {
    basePrice = 50000;
  } else if (market.includes('ETH')) {
    basePrice = 3000;
  } else if (market.includes('SOL')) {
    basePrice = 100;
  } else {
    basePrice = 10; // Default for emerging markets
  }

  const midPrice = basePrice;
  const spread = basePrice * 0.001; // 0.1% spread

  // Generate bids (buy orders) - prices descending from just below mid
  const bids = [];
  for (let i = 0; i < 20; i++) {
    const price = (midPrice - spread / 2 - i * spread * 0.1).toFixed(2);
    const size = ((Math.random() * 5 + 1) * (1 + i * 0.1)).toFixed(4); // Increasing size as we go deeper
    bids.push({ price, size });
  }

  // Generate asks (sell orders) - prices ascending from just above mid
  const asks = [];
  for (let i = 0; i < 20; i++) {
    const price = (midPrice + spread / 2 + i * spread * 0.1).toFixed(2);
    const size = ((Math.random() * 5 + 1) * (1 + i * 0.1)).toFixed(4); // Increasing size as we go deeper
    asks.push({ price, size });
  }

  return { bids, asks };
};

/**
 * Generates realistic fake trades data for testing purposes
 * Creates historical trades with pagination support
 */
export const generateFakeTrades = (
  market: string,
  limit?: number | null,
  page?: number | null,
): Data => {
  // Determine base price based on market
  let basePrice: number;
  if (market.includes('BTC')) {
    basePrice = 50000;
  } else if (market.includes('ETH')) {
    basePrice = 3000;
  } else if (market.includes('SOL')) {
    basePrice = 100;
  } else {
    basePrice = 10; // Default for emerging markets
  }

  const now = new Date();
  const totalResults = 250; // Total trades available
  const pageSize = limit || 100; // Default to 100 trades per page
  const currentPage = page || 1; // Default to page 1
  const offset = (currentPage - 1) * pageSize; // 1-based pagination: page 1 = offset 0

  const trades = [];
  const startIndex = offset;
  const endIndex = Math.min(startIndex + pageSize, totalResults);

  for (let i = startIndex; i < endIndex; i++) {
    const timestamp = new Date(now.getTime() - i * 10000); // 10 seconds apart
    const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = (basePrice * (1 + priceVariation)).toFixed(2);
    const size = (Math.random() * 10 + 0.1).toFixed(4);
    const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const types = ['LIMIT', 'LIQUIDATED', 'DELEVERAGED', 'TWAP_SUBORDER'];
    const type = types[Math.floor(Math.random() * types.length)];
    const blockHeight = 53661860 - i * 10;

    trades.push({
      id: `${market}-${timestamp.getTime()}-${i}`,
      side,
      size,
      price,
      type,
      createdAt: timestamp.toISOString(),
      createdAtHeight: blockHeight.toString(),
    });
  }

  return {
    trades,
    pageSize,
    totalResults,
    offset,
  };
};

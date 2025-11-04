import { Candle, CandleResolution, Price } from '../model/generated';

// Re-export for convenience
export { CandleResolution } from '../model/generated';

// Resolution in milliseconds
export const RESOLUTION_TO_MS: Record<CandleResolution, number> = {
  [CandleResolution.M1]: 60 * 1000,
  [CandleResolution.M5]: 5 * 60 * 1000,
  [CandleResolution.M15]: 15 * 60 * 1000,
  [CandleResolution.M30]: 30 * 60 * 1000,
  [CandleResolution.H1]: 60 * 60 * 1000,
  [CandleResolution.H4]: 4 * 60 * 60 * 1000,
  [CandleResolution.D1]: 24 * 60 * 60 * 1000,
};

/**
 * Aggregates price data into candles for a given resolution
 */
export function aggregatePricesToCandles(
  prices: Price[],
  resolution: CandleResolution,
  asset: string
): Candle[] {
  if (prices.length === 0) return [];

  const resolutionMs = RESOLUTION_TO_MS[resolution];
  const candleMap = new Map<number, Candle>();

  // Sort prices by timestamp
  const sortedPrices = [...prices].sort((a, b) => a.timestamp - b.timestamp);

  for (const price of sortedPrices) {
    // Convert nanoseconds to milliseconds if needed
    const timestampMs = price.timestamp > 1e12 ? Math.floor(price.timestamp / 1e6) : price.timestamp * 1000;
    
    // Calculate candle start time (bucket)
    const candleStartTime = Math.floor(timestampMs / resolutionMs) * resolutionMs;

    const existingCandle = candleMap.get(candleStartTime);
    const priceValue = price.price;

    if (!existingCandle) {
      // Create new candle
      const candleId = `${asset}:${resolution}:${candleStartTime}`;
      const candle = new Candle({
        id: candleId,
        ticker: asset,
        resolution,
        startedAt: BigInt(candleStartTime),
        open: priceValue,
        close: priceValue,
        high: priceValue,
        low: priceValue,
        volume: '0', // We don't have volume data from prices
        trades: 1,
      });
      candleMap.set(candleStartTime, candle);
    } else {
      // Update existing candle
      existingCandle.close = priceValue;
      existingCandle.high = maxPrice(existingCandle.high, priceValue);
      existingCandle.low = minPrice(existingCandle.low, priceValue);
      existingCandle.trades = (existingCandle.trades || 0) + 1;
    }
  }

  // Convert map to sorted array
  return Array.from(candleMap.values()).sort((a, b) => Number(a.startedAt - b.startedAt));
}

/**
 * Generates mock candle data for testing
 */
export function generateMockCandles(
  asset: string,
  resolution: CandleResolution,
  startTime: number,
  count: number,
  basePrice: number = 100
): Candle[] {
  const candles: Candle[] = [];
  const resolutionMs = RESOLUTION_TO_MS[resolution];
  let currentPrice = basePrice;

  for (let i = 0; i < count; i++) {
    const candleStartTime = startTime + i * resolutionMs;
    const volatility = basePrice * 0.02; // 2% volatility
    
    // Generate realistic OHLC data
    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    currentPrice = close; // Next candle starts where this one ended

    const candleId = `${asset}:${resolution}:${candleStartTime}`;
    const candle = new Candle({
      id: candleId,
      ticker: asset,
      resolution,
      startedAt: BigInt(candleStartTime),
      open: open.toFixed(6),
      close: close.toFixed(6),
      high: high.toFixed(6),
      low: low.toFixed(6),
      volume: (Math.random() * 1000000).toFixed(2), // Mock volume
      trades: Math.floor(Math.random() * 100) + 10,
    });
    candles.push(candle);
  }

  return candles;
}

// Helper functions for price comparison
function maxPrice(a: string, b: string): string {
  return parseFloat(a) > parseFloat(b) ? a : b;
}

function minPrice(a: string, b: string): string {
  return parseFloat(a) < parseFloat(b) ? a : b;
}


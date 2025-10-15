import {
  generateFakeHistoricalFunding,
  generateFakeOrderbook,
  generateFakeTrades,
} from '../../utils/fakeDataGenerators';
import { TimePeriod } from '../constants';
import { Data } from '../types';
import RestClient from './rest';

/**
 * @description REST endpoints for data unrelated to a particular address.
 */
export default class MarketsClient extends RestClient {
  async getPerpetualMarkets(market?: string): Promise<Data> {
    const uri = '/v4/perpetualMarkets';
    // return this.get(uri, { ticker: "MIRG.BA-USD" });

    // Load emerging markets data from JSON file
    try {
      const response = await fetch('/emerging_markets.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch emerging markets: ${response.status}`);
      }
      const emergingMarkets = await response.json();
      return emergingMarkets;
    } catch (error) {
      console.error('Error loading emerging markets:', error);
      // Fallback to empty markets if JSON loading fails
      return { markets: {} };
    }
  }

  async getPerpetualMarketOrderbook(market: string): Promise<Data> {
    const uri = `/v4/orderbooks/perpetualMarket/${market}`;

    // Generate mock orderbook data
    return generateFakeOrderbook(market);
  }

  async getPerpetualMarketTrades(
    market: string,
    startingBeforeOrAtHeight?: number | null,
    startingBeforeOrAt?: string | null,
    limit?: number | null,
    page?: number | null,
  ): Promise<Data> {
    const uri = `/v4/trades/perpetualMarket/${market}`;

    // Generate mock trades data with pagination support
    return generateFakeTrades(market, limit, page);
  }

  async getPerpetualMarketCandles(
    market: string,
    resolution: string,
    fromISO?: string | null,
    toISO?: string | null,
    limit?: number | null,
  ): Promise<Data> {
    const uri = `/v4/candles/perpetualMarkets/${market}`;

    const now = new Date();
    const count = limit || 10;
    const candles = [];

    for (let i = count - 1; i >= 0; i--) {
      const startedAt = new Date(now.getTime() - i * 60000); // 1 minute intervals
      const basePrice = 100 + Math.random() * 10;
      const open = basePrice.toFixed(2);
      const close = (basePrice + (Math.random() - 0.5) * 2).toFixed(2);
      const high = (Math.max(parseFloat(open), parseFloat(close)) + Math.random()).toFixed(2);
      const low = (Math.min(parseFloat(open), parseFloat(close)) - Math.random()).toFixed(2);

      candles.push({
        startedAt: startedAt.toISOString(),
        ticker: market,
        resolution,
        low,
        high,
        open,
        close,
        baseTokenVolume: (Math.random() * 1000).toFixed(2),
        usdVolume: (Math.random() * 100000).toFixed(2),
        trades: Math.floor(Math.random() * 100),
        startingOpenInterest: (Math.random() * 5000000).toFixed(2),
        orderbookMidPriceOpen: open,
        orderbookMidPriceClose: close,
        id: `${market}-${resolution}-${startedAt.getTime()}`,
      });
    }

    return { candles };
  }

  async getPerpetualMarketHistoricalFunding(
    market: string,
    effectiveBeforeOrAt?: string | null,
    effectiveBeforeOrAtHeight?: number | null,
    limit?: number | null,
  ): Promise<Data> {
    const { historicalFunding } = generateFakeHistoricalFunding(market, undefined);
    const cutoffTime = effectiveBeforeOrAt ? Date.parse(effectiveBeforeOrAt) : undefined;
    const cutoffHeight = effectiveBeforeOrAtHeight ?? undefined;

    let data = historicalFunding;
    if (cutoffTime != null) {
      data = data.filter((d: { effectiveAt: string }) => Date.parse(d.effectiveAt) <= cutoffTime);
    } else if (cutoffHeight != null) {
      const h = Number(cutoffHeight);
      data = data.filter((d: { effectiveAtHeight: any }) => Number(d.effectiveAtHeight) <= h);
    }
    if (limit && limit > 0) {
      data = data.slice(-limit); // most recent N
    }
    return { historicalFunding: data };
  }

  async getPerpetualMarketSparklines(period: string = TimePeriod.ONE_DAY): Promise<Data> {
    const uri = '/v4/sparklines';

    // SparklineResponseObject: keys are market tickers, values are arrays of price strings
    const mockSparklines: Record<string, string[]> = {
      'MIRG-USD': ['1.00', '1.01', '1.02', '0.99', '1.00', '1.01', '0.98', '1.00'],
      'DELTA-USD': ['5.00', '5.02', '4.98', '5.01', '5.00', '5.03', '4.99', '5.00'],
      'KBANK-USD': ['3.80', '3.82', '3.79', '3.81', '3.80', '3.83', '3.81', '3.80'],
    };

    return mockSparklines;
  }
}

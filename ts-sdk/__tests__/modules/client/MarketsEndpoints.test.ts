import markets from '../../../../public/emerging_markets.json';
import { Network } from '../../../src/clients/constants';
import { IndexerClient } from '../../../src/clients/indexer-client';

// Get first ticker from markets.json
const TEST_TICKER = Object.keys(markets.markets)[0]!;

// Mock fetch to return the emerging markets data
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(markets),
  } as Response),
);

describe('IndexerClient', () => {
  const client = new IndexerClient(Network.testnet().indexerConfig);

  describe('Market Endpoints', () => {
    it('Markets', async () => {
      const response = await client.markets.getPerpetualMarkets();
      const btc = response.markets[TEST_TICKER];
      const status = btc.status;
      expect(status).toBe('ACTIVE');
    });

    it(`${TEST_TICKER} Market`, async () => {
      const response = await client.markets.getPerpetualMarkets(TEST_TICKER);
      const btc = response.markets[TEST_TICKER];
      const status = btc.status;
      expect(status).toBe('ACTIVE');
    });

    it(`${TEST_TICKER} Trades`, async () => {
      const response = await client.markets.getPerpetualMarketTrades(TEST_TICKER);
      const trades = response.trades;
      expect(trades).not.toBeUndefined();
    });

    it(`${TEST_TICKER} Trades Pagination`, async () => {
      const response = await client.markets.getPerpetualMarketTrades(
        TEST_TICKER,
        undefined,
        undefined,
        1,
        1,
      );
      const trades = response.trades;
      expect(trades).not.toBeUndefined();

      if (trades.length > 0) {
        const trade = trades[0];
        expect(trade).not.toBeNull();

        expect(response.totalResults).toBeGreaterThanOrEqual(1);
      }

      expect(response.pageSize).toStrictEqual(1);
      expect(response.offset).toStrictEqual(0);
    });

    it(`${TEST_TICKER} Orderbook`, async () => {
      const response = await client.markets.getPerpetualMarketOrderbook(TEST_TICKER);
      const asks = response.asks;
      const bids = response.bids;
      expect(asks).not.toBeUndefined();
      expect(bids).not.toBeUndefined();
    });

    it(`${TEST_TICKER} Candles`, async () => {
      const response = await client.markets.getPerpetualMarketCandles(TEST_TICKER, '1MIN');
      const candles = response.candles;
      expect(candles).not.toBeUndefined();
    });

    it(`${TEST_TICKER} Historical Funding`, async () => {
      const response = await client.markets.getPerpetualMarketHistoricalFunding(TEST_TICKER);
      expect(response).not.toBeNull();
      const historicalFunding = response.historicalFunding;
      expect(historicalFunding).not.toBeNull();
      if (historicalFunding.length > 0) {
        const historicalFunding0 = historicalFunding[0];
        expect(historicalFunding0).not.toBeNull();
      }
    });

    it('Sparklines', async () => {
      const response = await client.markets.getPerpetualMarketSparklines();
      const btcSparklines = response[TEST_TICKER];
      expect(btcSparklines).not.toBeUndefined();
    });
  });
});

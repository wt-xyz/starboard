import { log } from '@/lib/telemetry';

export interface PriceData {
  id: string;
  asset: string;
  timestamp: number;
  price: string;
}

export interface IndexerPricesResponse {
  prices: PriceData[];
}

export interface CandleData {
  id: string;
  ticker: string;
  resolution: string;
  startedAt: string; // bigint as string
  open: string;
  close: string;
  high: string;
  low: string;
  volume?: string | null;
  trades?: number | null;
}

export interface IndexerCandlesResponse {
  candles: CandleData[];
}

export class IndexerGraphQLClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getPrices(asset: string, limit: number = 1000): Promise<PriceData[]> {
    try {
      const query = `
        query GetPrices($asset: String!, $limit: Int!) {
          prices(
            where: { asset: $asset }
            orderBy: timestamp_ASC
            limit: $limit
          ) {
            id
            asset
            timestamp
            price
          }
        }
      `;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { asset, limit },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data?.prices || [];
    } catch (error) {
      log('IndexerGraphQLClient/getPrices', error);
      throw error;
    }
  }

  async getLatestPrices(assets: string[]): Promise<Record<string, PriceData>> {
    try {
      const query = `
        query GetLatestPrices($assets: [String!]!) {
          prices(
            where: { asset_in: $assets }
            orderBy: timestamp_DESC
            limit: ${assets.length}
          ) {
            id
            asset
            timestamp
            price
          }
        }
      `;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { assets },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      const prices: PriceData[] = result.data?.prices || [];

      // Convert array to map by asset
      return prices.reduce(
        (acc, price) => {
          acc[price.asset] = price;
          return acc;
        },
        {} as Record<string, PriceData>
      );
    } catch (error) {
      log('IndexerGraphQLClient/getLatestPrices', error);
      throw error;
    }
  }

  async getCandles(
    ticker: string,
    resolution: string,
    fromMs: number,
    toMs: number,
    limit: number = 1000
  ): Promise<CandleData[]> {
    try {
      const query = `
        query GetCandles($ticker: String!, $resolution: CandleResolution!, $fromMs: BigInt!, $toMs: BigInt!, $limit: Int!) {
          candles(
            where: {
              ticker_eq: $ticker
              resolution_eq: $resolution
              startedAt_gte: $fromMs
              startedAt_lte: $toMs
            }
            orderBy: startedAt_ASC
            limit: $limit
          ) {
            id
            ticker
            resolution
            startedAt
            open
            close
            high
            low
            volume
            trades
          }
        }
      `;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            ticker,
            resolution,
            fromMs: fromMs.toString(),
            toMs: toMs.toString(),
            limit,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        log('IndexerGraphQLClient/getCandles/errors', result.errors);
        // Return empty array instead of throwing to allow fallback to mock data
        return [];
      }

      return result.data?.candles || [];
    } catch (error) {
      log('IndexerGraphQLClient/getCandles', error);
      // Return empty array to allow fallback to mock data
      return [];
    }
  }
}

// Singleton instance
let indexerGraphQLClient: IndexerGraphQLClient | null = null;

export function getIndexerGraphQLClient(): IndexerGraphQLClient | null {
  if (indexerGraphQLClient) {
    return indexerGraphQLClient;
  }

  const endpoint = getIndexerGraphQLEndpoint();
  if (endpoint) {
    indexerGraphQLClient = new IndexerGraphQLClient(endpoint);
    return indexerGraphQLClient;
  }

  return null;
}

function getIndexerGraphQLEndpoint(): string | null {
  if (typeof window !== 'undefined') {
    // Try to get from environment
    const url = import.meta.env.VITE_INDEXER_GRAPHQL_URL;
    if (url) return url;

    // For local development, default to localhost
    if (import.meta.env.DEV) {
      return 'http://localhost:4350/graphql';
    }
  }
  return null;
}

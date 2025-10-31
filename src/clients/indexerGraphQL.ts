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
      return prices.reduce((acc, price) => {
        acc[price.asset] = price;
        return acc;
      }, {} as Record<string, PriceData>);
    } catch (error) {
      log('IndexerGraphQLClient/getLatestPrices', error);
      throw error;
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


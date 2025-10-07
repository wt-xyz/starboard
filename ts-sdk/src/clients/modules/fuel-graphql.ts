import { GraphQLClient, gql } from 'graphql-request';

import { tai64ToDate } from '../../lib/date';

/**
 * @description Client for interacting with Fuel's GraphQL API
 * This is used as an alternative to Cosmos Tendermint RPC when the validator
 * endpoint is a GraphQL endpoint (e.g., https://testnet.fuel.network/v1/graphql)
 */
export class FuelGraphQLClient {
  private readonly client: GraphQLClient;
  public readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.client = new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * @description Get the latest block height from Fuel network
   *
   * @returns The latest block height as a number
   */
  async getLatestBlockHeight(): Promise<number> {
    const query = gql`
      query LatestBlock {
        health
      }
    `;

    try {
      const data = await this.client.request<{
        extensions: {
          current_fuel_block_height: number;
        };
      }>(query);

      if (!data.extensions) {
        throw new Error('No extensions returned from Fuel GraphQL endpoint');
      }

      return data.extensions.current_fuel_block_height;
    } catch (error) {
      throw new Error(
        `Failed to fetch latest block height from Fuel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * @description Get block information by height
   *
   * @param height - Block height to query
   * @returns Block data
   */
  async getBlock(height: number | 'latest' = 'latest'): Promise<{
    time: string;
    height: number;
    id: string;
  }> {
    const fragment = gql`
      {
        id
        height
        header {
          id
          height
          time
        }
        transactions {
          id
          status {
            __typename
          }
        }
      }
    `;

    const queryByBlock = gql`
      query Block($height: U64) {
        block(height: $height) {
          ...${fragment}
        }
      }
    `;

    const queryLatest = gql`
      query LatestBlock {
        chain {
          latestBlock {
            ...${fragment}
          }
        }
      }
    `;

    try {
      const data = await this.client.request<any>(
        height === 'latest' ? queryLatest : queryByBlock,
        {
          height: height.toString(),
        },
      );

      const blockData = height === 'latest' ? data.chain.latestBlock : data.block;
      return {
        time: tai64ToDate(blockData.header.time).toISOString(),
        height: parseInt(blockData.height, 10),
        id: blockData.id,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch block from Fuel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * @description Health check - verifies the GraphQL endpoint is responsive
   *
   * @returns true if endpoint is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getLatestBlockHeight();
      return true;
    } catch {
      return false;
    }
  }
}

import axios, { AxiosInstance } from 'axios';
import {
    GET_ACCOUNT_POSITIONS,
    GET_CLOSED_POSITIONS,
    GET_CLOSED_POSITIONS_COUNT,
    GET_POSITION_HISTORY,
    GET_POSITION_KEYS,
} from '../../services/queries/positions.graphql';
import {
    IndexerPosition,
    PaginationParams,
    TradeFilters,
} from '../../types/analytics';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface PositionsQueryResponse {
  positions: IndexerPosition[];
}

interface PositionKeysQueryResponse {
  positionKeys: Array<{
    id: string;
    account: string;
    indexAssetId: string;
    isLong: boolean;
  }>;
}

export default class PositionsGraphQLClient {
  private readonly client: AxiosInstance;
  private readonly endpoint: string;

  constructor(graphqlEndpoint: string, timeout: number = 10000) {
    this.endpoint = graphqlEndpoint;
    this.client = axios.create({
      baseURL: graphqlEndpoint,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async query<T>(query: string, variables: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.post<GraphQLResponse<T>>('', {
        query,
        variables,
      });

      if (response.data.errors && response.data.errors.length > 0) {
        throw new Error(`GraphQL Error: ${response.data.errors[0].message}`);
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GraphQL request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getClosedPositions(
    account: string,
    filters: TradeFilters = {},
    pagination: PaginationParams
  ): Promise<IndexerPosition[]> {
    const variables: Record<string, any> = {
      account,
      limit: pagination.limit,
      offset: pagination.offset,
    };

    if (filters.dateFrom) {
      variables.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      variables.dateTo = filters.dateTo;
    }
    if (filters.asset) {
      variables.asset = filters.asset;
    }
    if (filters.side) {
      variables.isLong = filters.side === 'LONG';
    }

    const result = await this.query<PositionsQueryResponse>(
      GET_CLOSED_POSITIONS,
      variables
    );

    return result.positions;
  }

  async getClosedPositionsCount(
    account: string,
    filters: TradeFilters = {}
  ): Promise<number> {
    const variables: Record<string, any> = {
      account,
    };

    if (filters.dateFrom) {
      variables.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      variables.dateTo = filters.dateTo;
    }
    if (filters.asset) {
      variables.asset = filters.asset;
    }
    if (filters.side) {
      variables.isLong = filters.side === 'LONG';
    }

    const result = await this.query<PositionsQueryResponse>(
      GET_CLOSED_POSITIONS_COUNT,
      variables
    );

    return result.positions.length;
  }

  async getPositionHistory(positionKeyId: string): Promise<IndexerPosition[]> {
    const result = await this.query<PositionsQueryResponse>(
      GET_POSITION_HISTORY,
      { positionKeyId }
    );

    return result.positions;
  }

  async getAccountPositions(
    account: string,
    limit?: number,
    offset?: number
  ): Promise<IndexerPosition[]> {
    const variables: Record<string, any> = { account };
    
    if (limit !== undefined) {
      variables.limit = limit;
    }
    if (offset !== undefined) {
      variables.offset = offset;
    }

    const result = await this.query<PositionsQueryResponse>(
      GET_ACCOUNT_POSITIONS,
      variables
    );

    return result.positions;
  }

  async getPositionKeys(account: string): Promise<Array<{
    id: string;
    account: string;
    indexAssetId: string;
    isLong: boolean;
  }>> {
    const result = await this.query<PositionKeysQueryResponse>(
      GET_POSITION_KEYS,
      { account }
    );

    return result.positionKeys;
  }

  async *getPositionsBatch(
    account: string,
    batchSize: number = 100
  ): AsyncGenerator<IndexerPosition[], void, unknown> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const positions = await this.getAccountPositions(account, batchSize, offset);
      
      if (positions.length === 0) {
        hasMore = false;
      } else {
        yield positions;
        offset += positions.length;
        hasMore = positions.length === batchSize;
      }
    }
  }
}

import axios, { AxiosInstance } from 'axios';

export interface PositionKeyData {
  id: string;
  account: string;
  indexAssetId: string;
  isLong: boolean;
}

export interface PositionData {
  id: string;
  positionKey: PositionKeyData;
  collateralAmout: string;
  size: string;
  timestamp: number;
  latest: boolean;
  change: 'INCREASE' | 'DECREASE' | 'CLOSE' | 'LIQUIDATE';
  collateralTransferred: string;
  positionFee: string;
  fundingRate: string;
  pnlDelta: string;
  realizedFundingRate: string;
  realizedPnl: string;
}

export interface PositionsResponse {
  data: {
    positions: PositionData[];
  };
}

export interface PositionKeysResponse {
  data: {
    positionKeys: PositionKeyData[];
  };
}

/**
 * @description GraphQL client for querying positions from the Squid indexer
 */
export default class PositionsGraphQLClient {
  private readonly graphqlEndpoint: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(graphqlEndpoint: string) {
    this.graphqlEndpoint = graphqlEndpoint;
    this.axiosInstance = axios.create({
      timeout: 10000,
    });
  }

  /**
   * Get all positions with optional filtering
   */
  async getPositions(options?: {
    latestOnly?: boolean;
    account?: string;
    limit?: number;
    orderBy?: string;
  }): Promise<PositionData[]> {
    const whereConditions: string[] = [];
    
    if (options?.latestOnly) {
      whereConditions.push('latest_eq: true');
    }
    
    if (options?.account) {
      whereConditions.push(`positionKey: { account_eq: "${options.account}" }`);
    }

    const whereClause = whereConditions.length > 0 
      ? `where: { ${whereConditions.join(', ')} }` 
      : '';
    
    const limitClause = options?.limit ? `limit: ${options.limit}` : '';
    const orderByClause = options?.orderBy ? `orderBy: ${options.orderBy}` : '';

    const params = [whereClause, limitClause, orderByClause]
      .filter(Boolean)
      .join(', ');

    const query = `
      query GetPositions {
        positions${params ? `(${params})` : ''} {
          id
          positionKey {
            id
            account
            indexAssetId
            isLong
          }
          collateralAmout
          size
          timestamp
          latest
          change
          collateralTransferred
          positionFee
          fundingRate
          pnlDelta
          realizedFundingRate
          realizedPnl
        }
      }
    `;

    const response = await this.axiosInstance.post<PositionsResponse>(
      this.graphqlEndpoint,
      { query }
    );

    return response.data.data.positions;
  }

  /**
   * Get position keys (account + asset combinations)
   */
  async getPositionKeys(options?: {
    account?: string;
    indexAssetId?: string;
    isLong?: boolean;
  }): Promise<PositionKeyData[]> {
    const whereConditions: string[] = [];
    
    if (options?.account) {
      whereConditions.push(`account_eq: "${options.account}"`);
    }
    
    if (options?.indexAssetId) {
      whereConditions.push(`indexAssetId_eq: "${options.indexAssetId}"`);
    }
    
    if (options?.isLong !== undefined) {
      whereConditions.push(`isLong_eq: ${options.isLong}`);
    }

    const whereClause = whereConditions.length > 0 
      ? `where: { ${whereConditions.join(', ')} }` 
      : '';

    const query = `
      query GetPositionKeys {
        positionKeys${whereClause ? `(${whereClause})` : ''} {
          id
          account
          indexAssetId
          isLong
        }
      }
    `;

    const response = await this.axiosInstance.post<PositionKeysResponse>(
      this.graphqlEndpoint,
      { query }
    );

    return response.data.data.positionKeys;
  }

  /**
   * Get latest positions for a specific account
   */
  async getLatestPositionsByAccount(account: string): Promise<PositionData[]> {
    return this.getPositions({
      latestOnly: true,
      account,
      orderBy: 'timestamp_DESC',
    });
  }

  /**
   * Get position history for a specific account and asset
   */
  async getPositionHistory(
    account: string,
    indexAssetId?: string,
    limit: number = 50
  ): Promise<PositionData[]> {
    const whereConditions = [`positionKey: { account_eq: "${account}"`];
    
    if (indexAssetId) {
      whereConditions.push(`indexAssetId_eq: "${indexAssetId}"`);
    }
    
    whereConditions.push('}');

    const query = `
      query GetPositionHistory {
        positions(
          where: { ${whereConditions.join(', ')} }
          orderBy: timestamp_DESC
          limit: ${limit}
        ) {
          id
          positionKey {
            id
            account
            indexAssetId
            isLong
          }
          collateralAmout
          size
          timestamp
          latest
          change
          collateralTransferred
          positionFee
          fundingRate
          pnlDelta
          realizedFundingRate
          realizedPnl
        }
      }
    `;

    const response = await this.axiosInstance.post<PositionsResponse>(
      this.graphqlEndpoint,
      { query }
    );

    return response.data.data.positions;
  }
}


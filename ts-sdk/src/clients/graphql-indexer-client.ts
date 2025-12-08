import { AxiosProxyConfig } from 'axios';

import { DEFAULT_API_TIMEOUT } from './constants';
import GraphQLClient from './modules/graphql';

// ============ Types ============

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeType {
  Limit = 'Limit',
  Liquidation = 'Liquidation',
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum PositionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LIQUIDATED = 'LIQUIDATED',
}

export interface GraphQLAccount {
  id: string;
  address?: string | null;
  subaccountNumber?: number;
  subaccountId?: string;
  isLiquidator?: boolean;
  isHandler?: boolean;
  isManager?: boolean;
}

export interface GraphQLMarket {
  id: string;
  ticker: string;
  oraclePrice?: string | null;
  atomicResolution?: number;
  tickSize?: string;
  stepSize?: string;
  status?: string;
}

export interface GraphQLPosition {
  id: string;
  status?: PositionStatus | null;
  side?: PositionSide | null;
  size?: string | null;
  entryPrice?: string | null;
  exitPrice?: string | null;
  realizedPnl?: string | null;
  unrealizedPnl?: string | null;
  ticker?: string | null;
  createdAt?: string | null;
  closedAt?: string | null;
  account?: GraphQLAccount | null;
  market?: GraphQLMarket | null;
}

export interface GraphQLTrade {
  id: string;
  createdAt?: string | null;
  createdAtHeight?: number | null;
  side?: OrderSide | null;
  price?: string | null;
  size?: string | null;
  tradeType?: TradeType | null;
  market?: GraphQLMarket | null;
  position?: GraphQLPosition | null;
}

export interface GraphQLPayment {
  id: string;
  createdAt?: string | null;
  createdAtHeight?: number | null;
  ticker?: string | null;
  oraclePrice?: string | null;
  size?: string | null;
  side?: PositionSide | null;
  rate?: string | null;
  payment?: string | null;
  position?: GraphQLPosition | null;
  market?: GraphQLMarket | null;
}

// ============ Queries ============

const GET_USER_TRADES_QUERY = `
  query GetUserTrades($address: String!, $limit: Int, $offset: Int) {
    trades(
      where: { position: { account: { address_eq: $address } } }
      limit: $limit
      offset: $offset
      orderBy: createdAt_DESC
    ) {
      id
      createdAt
      createdAtHeight
      side
      price
      size
      tradeType
      market {
        id
        ticker
        oraclePrice
      }
      position {
        id
        side
        ticker
        account {
          id
          address
        }
      }
    }
  }
`;

const GET_ALL_TRADES_QUERY = `
  query GetAllTrades($limit: Int, $offset: Int) {
    trades(
      limit: $limit
      offset: $offset
      orderBy: createdAt_DESC
    ) {
      id
      createdAt
      createdAtHeight
      side
      price
      size
      tradeType
      market {
        id
        ticker
        oraclePrice
      }
      position {
        id
        side
        ticker
        account {
          id
          address
        }
      }
    }
  }
`;

const GET_USER_POSITIONS_QUERY = `
  query GetUserPositions($address: String!, $status: PositionStatus, $limit: Int, $offset: Int) {
    positions(
      where: { account: { address_eq: $address }, status_eq: $status }
      limit: $limit
      offset: $offset
      orderBy: createdAt_DESC
    ) {
      id
      status
      side
      size
      entryPrice
      exitPrice
      realizedPnl
      unrealizedPnl
      ticker
      createdAt
      closedAt
      collateral
      positionFees
      account {
        id
        address
      }
      market {
        id
        ticker
        oraclePrice
      }
    }
  }
`;

const GET_MARKETS_QUERY = `
  query GetMarkets($limit: Int, $offset: Int) {
    markets(
      limit: $limit
      offset: $offset
    ) {
      id
      ticker
      atomicResolution
      baseOpenInterest
      initialMarginFraction
      maintenanceMarginFraction
      marketType
      nextFundingRate
      openInterest
      oraclePrice
      priceChange24H
      status
      stepSize
      tickSize
      trades24H
      volume24H
    }
  }
`;

const GET_USER_PAYMENTS_QUERY = `
  query GetUserPayments($address: String!, $limit: Int, $offset: Int) {
    payments(
      where: { position: { account: { address_eq: $address } } }
      limit: $limit
      offset: $offset
      orderBy: createdAt_DESC
    ) {
      id
      createdAt
      createdAtHeight
      ticker
      oraclePrice
      size
      side
      rate
      payment
      position {
        id
        ticker
        account {
          id
          address
        }
      }
      market {
        id
        ticker
      }
    }
  }
`;

// ============ Config ============

export class GraphQLIndexerConfig {
  public endpoint: string;
  public proxy?: AxiosProxyConfig;

  constructor(endpoint: string, proxy?: AxiosProxyConfig) {
    this.endpoint = endpoint;
    this.proxy = proxy;
  }
}

// ============ Client ============

/**
 * @description GraphQL client for Squid-based indexers (like Starboard)
 *
 * Unlike the REST-based IndexerClient, this client uses GraphQL queries
 * to interact with Squid indexers that expose a /graphql endpoint.
 */
export class GraphQLIndexerClient {
  public readonly config: GraphQLIndexerConfig;
  readonly apiTimeout: number;
  private readonly client: GraphQLClient;

  constructor(config: GraphQLIndexerConfig, apiTimeout?: number) {
    this.config = config;
    this.apiTimeout = apiTimeout ?? DEFAULT_API_TIMEOUT;
    this.client = new GraphQLClient(config.endpoint, this.apiTimeout, config.proxy);
  }

  // ============ Trade Methods ============

  /**
   * Get trades for a specific account address
   * @param address - Account address to filter by
   * @param limit - Maximum number of trades to return
   * @param offset - Number of trades to skip (for pagination)
   */
  async getAccountTrades(
    address: string,
    limit?: number,
    offset?: number
  ): Promise<GraphQLTrade[]> {
    const response = await this.client.query<{ trades: GraphQLTrade[] }>(
      GET_USER_TRADES_QUERY,
      { address, limit, offset }
    );
    return response.trades;
  }

  /**
   * Get all trades (no address filter)
   * @param limit - Maximum number of trades to return
   * @param offset - Number of trades to skip (for pagination)
   */
  async getAllTrades(limit?: number, offset?: number): Promise<GraphQLTrade[]> {
    const response = await this.client.query<{ trades: GraphQLTrade[] }>(
      GET_ALL_TRADES_QUERY,
      { limit, offset }
    );
    return response.trades;
  }

  // ============ Position Methods ============

  /**
   * Get positions for a specific account address
   * @param address - Account address to filter by
   * @param status - Position status filter (OPEN, CLOSED, LIQUIDATED)
   * @param limit - Maximum number of positions to return
   * @param offset - Number of positions to skip (for pagination)
   */
  async getAccountPositions(
    address: string,
    status?: PositionStatus,
    limit?: number,
    offset?: number
  ): Promise<GraphQLPosition[]> {
    const response = await this.client.query<{ positions: GraphQLPosition[] }>(
      GET_USER_POSITIONS_QUERY,
      { address, status, limit, offset }
    );
    return response.positions;
  }

  // ============ Market Methods ============

  /**
   * Get all markets
   * @param limit - Maximum number of markets to return
   * @param offset - Number of markets to skip (for pagination)
   */
  async getMarkets(limit?: number, offset?: number): Promise<GraphQLMarket[]> {
    const response = await this.client.query<{ markets: GraphQLMarket[] }>(
      GET_MARKETS_QUERY,
      { limit, offset }
    );
    return response.markets;
  }

  // ============ Payment Methods ============

  /**
   * Get funding payments for a specific account address
   * @param address - Account address to filter by
   * @param limit - Maximum number of payments to return
   * @param offset - Number of payments to skip (for pagination)
   */
  async getAccountPayments(
    address: string,
    limit?: number,
    offset?: number
  ): Promise<GraphQLPayment[]> {
    const response = await this.client.query<{ payments: GraphQLPayment[] }>(
      GET_USER_PAYMENTS_QUERY,
      { address, limit, offset }
    );
    return response.payments;
  }

  // ============ Raw Query ============

  /**
   * Execute a raw GraphQL query
   * @param query - GraphQL query string
   * @param variables - Query variables
   */
  async query<T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    return this.client.query<T>(query, variables);
  }
}


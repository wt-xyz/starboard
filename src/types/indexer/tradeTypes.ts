/**
 * GraphQL Trade types from the Starboard indexer.
 *
 * These types represent the response from the indexer's `trades` GraphQL query.
 * The indexer is pool-based (no market makers) and only has market orders
 * (no limit orders / unfilled orders).
 */

/**
 * Trade side - matches OrderSide enum from schema
 */
export enum GraphQLOrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Trade type - matches TradeType enum from schema
 * Note: In pool-based system, all trades are effectively market orders,
 * but the indexer reports them as "Limit"
 */
export enum GraphQLTradeType {
  Limit = 'Limit',
  Liquidation = 'Liquidation',
}

/**
 * Position side - matches PositionSide enum from schema
 */
export enum GraphQLPositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

/**
 * Market data included in trade response
 */
export interface GraphQLTradeMarket {
  id: string;
  ticker: string;
  oraclePrice?: string | null;
  atomicResolution?: number;
  tickSize?: string;
  stepSize?: string;
}

/**
 * Account data included in position
 */
export interface GraphQLTradeAccount {
  id: string;
  address?: string | null;
  subaccountNumber?: number;
}

/**
 * Position data included in trade response
 */
export interface GraphQLTradePosition {
  id: string;
  account?: GraphQLTradeAccount | null;
  side?: GraphQLPositionSide | null;
  ticker?: string | null;
  entryPrice?: string | null;
  size?: string | null;
  realizedPnl?: string | null;
}

/**
 * Trade object from GraphQL query
 */
export interface GraphQLTrade {
  id: string;
  createdAt?: string | null;
  createdAtHeight?: number | null;
  side?: GraphQLOrderSide | null;
  price?: string | null;
  size?: string | null;
  tradeType?: GraphQLTradeType | null;
  market?: GraphQLTradeMarket | null;
  position?: GraphQLTradePosition | null;
}

/**
 * Response from trades GraphQL query
 */
export interface GraphQLTradesResponse {
  trades: GraphQLTrade[];
}

/**
 * Variables for the trades GraphQL query
 */
export interface GraphQLTradesVariables {
  address?: string;
  limit?: number;
  offset?: number;
}

/**
 * GraphQL query for fetching user trades
 */
export const GET_USER_TRADES_QUERY = `
  query GetUserTrades($limit: Int, $offset: Int) {
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
        atomicResolution
        tickSize
        stepSize
      }
      position {
        id
        side
        ticker
        entryPrice
        size
        realizedPnl
        account {
          id
          address
          subaccountNumber
        }
      }
    }
  }
`;

/**
 * GraphQL query for fetching trades filtered by account address
 * Note: The actual filtering by address happens client-side since
 * the Squid GraphQL may not support nested where clauses
 */
export const GET_ALL_TRADES_QUERY = `
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


export * from './indexer-utils';

export enum PositionChange {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  CLOSE = 'CLOSE',
  LIQUIDATE = 'LIQUIDATE',
}

export interface Price {
  id: string;
  assetId: string;
  timestamp: number;
  price: string;
}

export interface Liquidity {
  id: string;
  provider: string;
  stable: bigint;
  lpAmount: bigint;
  timestamp: number;
  latest: boolean;
}

export interface TotalLiquidity {
  id: string;
  stable: bigint;
  lpAmount: bigint;
  lastTimestamp: number;
}

export interface PositionKey {
  id: string;
  account: string;
  indexAssetId: string;
  isLong: boolean;
}

export interface Position {
  id: string;
  positionKey: PositionKey;
  collateralAmout: string;
  size: string;
  timestamp: number;
  latest: boolean;
  change: PositionChange;
}

export interface TotalPosition {
  id: string;
  indexAssetId: string;
  isLong: boolean;
  collateralAmout: string;
  size: string;
  lastTimestamp: number;
}

export interface IndexerQueryResponse<T> {
  data: T;
}

export interface EntityResponse<T> {
  [key: string]: T[];
}

export interface IndexerQueryParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PriceQueryParams extends IndexerQueryParams {
  assetId?: string;
  timestampFrom?: number;
  timestampTo?: number;
}

export interface LiquidityQueryParams extends IndexerQueryParams {
  provider?: string;
  timestampFrom?: number;
  timestampTo?: number;
  latest?: boolean;
}

export interface PositionQueryParams extends IndexerQueryParams {
  account?: string;
  indexAssetId?: string;
  isLong?: boolean;
  timestampFrom?: number;
  timestampTo?: number;
  latest?: boolean;
  change?: PositionChange;
}

export interface TotalPositionQueryParams extends IndexerQueryParams {
  indexAssetId?: string;
  isLong?: boolean;
  timestampFrom?: number;
  timestampTo?: number;
}

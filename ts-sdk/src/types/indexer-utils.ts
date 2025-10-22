import { Position, PositionChange, TotalLiquidity } from './indexer';

export type CreateEntity<T> = Omit<T, 'id'> & {
  id?: string;
};

export type UpdateEntity<T> = Partial<T> & {
  id: string;
};

export type EntityOrNull<T> = T | null;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TimeRange {
  from: number;
  to: number;
}

export interface SortOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: SortOptions;
  filters?: FilterOptions;
  timeRange?: TimeRange;
}

export class IndexerUtils {
  static bigintToString(value: bigint): string {
    return value.toString();
  }

  static stringToBigint(value: string): bigint {
    return BigInt(value);
  }

  static formatPrice(price: string, decimals: number = 6): string {
    const num = parseFloat(price);
    return num.toFixed(decimals);
  }

  static calculatePositionValue(position: Position, currentPrice: string): string {
    const size = parseFloat(position.size);
    const price = parseFloat(currentPrice);
    return (size * price).toString();
  }

  static isPositionProfitable(
    position: Position,
    entryPrice: string,
    currentPrice: string
  ): boolean {
    const entry = parseFloat(entryPrice);
    const current = parseFloat(currentPrice);
    
    if (position.positionKey.isLong) {
      return current > entry;
    } else {
      return current < entry;
    }
  }

  static calculatePnL(
    position: Position,
    entryPrice: string,
    currentPrice: string
  ): string {
    const size = parseFloat(position.size);
    const entry = parseFloat(entryPrice);
    const current = parseFloat(currentPrice);
    
    let pnl: number;
    if (position.positionKey.isLong) {
      pnl = (current - entry) * size;
    } else {
      pnl = (entry - current) * size;
    }
    
    return pnl.toString();
  }

  static groupPositionsByAsset(positions: Position[]): Record<string, Position[]> {
    return positions.reduce((acc, position) => {
      const assetId = position.positionKey.indexAssetId;
      if (!acc[assetId]) {
        acc[assetId] = [];
      }
      acc[assetId].push(position);
      return acc;
    }, {} as Record<string, Position[]>);
  }

  static filterPositionsByAccount(positions: Position[], account: string): Position[] {
    return positions.filter(position => position.positionKey.account === account);
  }

  static filterPositionsByAsset(positions: Position[], assetId: string): Position[] {
    return positions.filter(position => position.positionKey.indexAssetId === assetId);
  }

  static getLatestPosition(positions: Position[]): Position | null {
    const latestPositions = positions.filter(p => p.latest);
    return latestPositions.length > 0 ? latestPositions[0] : null;
  }

  static calculateTotalLiquidityValue(totalLiquidity: TotalLiquidity, price: string): string {
    const stable = parseFloat(totalLiquidity.stable.toString());
    const priceValue = parseFloat(price);
    return (stable * priceValue).toString();
  }

  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString();
  }

  static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  static isValidPositionChange(change: string): change is PositionChange {
    return Object.values(PositionChange).includes(change as PositionChange);
  }

  static createTimeRangeForDays(days: number): TimeRange {
    const now = this.getCurrentTimestamp();
    const from = now - (days * 24 * 60 * 60);
    return { from, to: now };
  }

  static createTimeRangeForHours(hours: number): TimeRange {
    const now = this.getCurrentTimestamp();
    const from = now - (hours * 60 * 60);
    return { from, to: now };
  }
}

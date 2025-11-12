export interface PerformanceMetrics {
  
  totalPnl: string;
  totalPnlPercent: number;
  realizedPnl: string;

  winRate: number;
  avgWin: string;
  avgLoss: string;
  profitFactor: number;

  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;

  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;

  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  currentStreakType: 'WIN' | 'LOSS' | 'NONE';

  avgTradeDurationSeconds: number;
  avgPositionSize: string;
  largestWin: string;
  largestLoss: string;

  totalFees: string;
  netFunding: string;
  avgFeePerTrade: string;
}

export interface TradeHistoryItem {
  id: string;
  positionKeyId: string;

  asset: string;
  side: 'LONG' | 'SHORT';

  entryPrice: string;
  exitPrice: string;
  size: string;

  openTime: number;
  closeTime: number;
  durationSeconds: number;

  realizedPnl: string;
  pnlPercent: number;
  roe: number;

  fees: string;
  fundingPaid: string;

  status: 'CLOSED' | 'LIQUIDATED';

  collateral: string;
}

export interface TradeHistoryResponse {
  trades: TradeHistoryItem[];
  totalCount: number;
  
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  
  aggregates: {
    totalPnl: string;
    totalVolume: string;
    avgPnl: string;
    winRate: number;
  };
}

export interface TradeFilters {
  dateFrom?: number;      
  dateTo?: number;        
  asset?: string;         
  side?: 'LONG' | 'SHORT';
  profitOnly?: boolean;   
  lossOnly?: boolean;     
  minSize?: string;       
  maxSize?: string;       
  status?: 'CLOSED' | 'LIQUIDATED';
}

export interface PaginationParams {
  limit: number;          
  offset: number;
  sortBy?: 'timestamp' | 'pnl' | 'size' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface AggregatedTradeStats {
  period: string;         
  periodStart: number;
  periodEnd: number;
  
  tradeCount: number;
  totalPnl: string;
  totalVolume: string;
  winRate: number;
  
  avgPnl: string;
  avgSize: string;
  totalFees: string;
}

export type AggregationPeriod = 'hour' | 'day' | 'week' | 'month';

export interface EquityCurvePoint {
  timestamp: number;
  equity: number;
  cumulativePnl: number;
}

export interface MaxDrawdownResult {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakValue: number;
  troughValue: number;
  peakTimestamp: number;
  troughTimestamp: number;
  recoveryTimestamp?: number;
  currentDrawdown: number;
}

export interface IndexerPosition {
  id: string;
  positionKey: {
    id: string;
    account: string;
    indexAssetId: string;
    isLong: boolean;
  };
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

export interface EnrichedPosition extends IndexerPosition {
  entryPrice?: string;
  exitPrice?: string;
  durationSeconds?: number;
  roe?: number;
}

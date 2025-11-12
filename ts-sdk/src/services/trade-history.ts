import BigNumber from 'bignumber.js';
import {
  TradeHistoryItem,
  TradeHistoryResponse,
  TradeFilters,
  PaginationParams,
  IndexerPosition,
  AggregatedTradeStats,
  AggregationPeriod,
  EnrichedPosition,
} from '../types/analytics';
import PositionsGraphQLClient from '../clients/modules/positions-graphql';

export class TradeHistoryService {
  private graphqlClient: PositionsGraphQLClient;

  constructor(graphqlEndpoint: string) {
    this.graphqlClient = new PositionsGraphQLClient(graphqlEndpoint);
  }

  async getTradeHistory(
    account: string,
    filters: TradeFilters = {},
    pagination: PaginationParams = { limit: 25, offset: 0, sortOrder: 'desc' }
  ): Promise<TradeHistoryResponse> {
    
    const positions = await this.graphqlClient.getClosedPositions(
      account,
      filters,
      pagination
    );

    const totalCount = await this.graphqlClient.getClosedPositionsCount(account, filters);

    const trades = await this.buildTradesFromPositions(positions, account);

    const filteredTrades = this.applyClientSideFilters(trades, filters);

    const sortedTrades = this.sortTrades(filteredTrades, pagination);

    const aggregates = this.calculateAggregates(sortedTrades);

    const paginationInfo = {
      currentPage: Math.floor(pagination.offset / pagination.limit),
      pageSize: pagination.limit,
      totalPages: Math.ceil(totalCount / pagination.limit),
      hasNextPage: pagination.offset + pagination.limit < totalCount,
      hasPreviousPage: pagination.offset > 0,
    };

    return {
      trades: sortedTrades,
      totalCount,
      pagination: paginationInfo,
      aggregates,
    };
  }

  private async buildTradesFromPositions(
    closedPositions: IndexerPosition[],
    account: string
  ): Promise<TradeHistoryItem[]> {
    const trades: TradeHistoryItem[] = [];

    const positionKeyGroups = new Map<string, IndexerPosition[]>();
    
    for (const position of closedPositions) {
      const keyId = position.positionKey.id;
      if (!positionKeyGroups.has(keyId)) {
        positionKeyGroups.set(keyId, []);
      }
      positionKeyGroups.get(keyId)!.push(position);
    }

    for (const [positionKeyId, closePositions] of positionKeyGroups) {
      for (const closePosition of closePositions) {
        try {
          
          const history = await this.graphqlClient.getPositionHistory(positionKeyId);

          const trade = this.buildTradeFromHistory(history, closePosition);
          if (trade) {
            trades.push(trade);
          }
        } catch (error) {
          console.error(`Failed to build trade for position ${positionKeyId}:`, error);
          
          trades.push(this.buildTradeFromClosePosition(closePosition));
        }
      }
    }

    return trades;
  }

  private buildTradeFromHistory(
    history: IndexerPosition[],
    closePosition: IndexerPosition
  ): TradeHistoryItem | null {
    if (history.length === 0) return null;

    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

    const openPosition = sortedHistory.find((p) => p.change === 'INCREASE');
    if (!openPosition) {
      return this.buildTradeFromClosePosition(closePosition);
    }

    const increases = sortedHistory.filter(
      (p) => p.change === 'INCREASE' && p.timestamp <= closePosition.timestamp
    );

    let totalSize = new BigNumber(0);
    let weightedPrice = new BigNumber(0);

    for (const inc of increases) {
      const size = new BigNumber(inc.size).abs();
      const pnlDelta = new BigNumber(inc.pnlDelta);

      if (!size.isZero()) {
        const approxPrice = new BigNumber(inc.collateralAmout).plus(pnlDelta).div(size);
        weightedPrice = weightedPrice.plus(approxPrice.times(size));
        totalSize = totalSize.plus(size);
      }
    }

    const entryPrice = totalSize.isZero()
      ? new BigNumber(0)
      : weightedPrice.div(totalSize);

    const closeSize = new BigNumber(closePosition.size).abs();
    const exitPrice = closeSize.isZero()
      ? new BigNumber(0)
      : new BigNumber(closePosition.collateralAmout)
          .plus(closePosition.pnlDelta)
          .div(closeSize);

    const totalFees = sortedHistory.reduce(
      (sum, p) => sum.plus(p.positionFee),
      new BigNumber(0)
    );

    const totalFunding = sortedHistory.reduce(
      (sum, p) => sum.plus(p.realizedFundingRate),
      new BigNumber(0)
    );

    const durationSeconds = Math.floor(
      (closePosition.timestamp - openPosition.timestamp) / 1000
    );

    const collateral = new BigNumber(closePosition.collateralAmout);
    const pnl = new BigNumber(closePosition.realizedPnl);
    const roe = collateral.isZero() ? 0 : pnl.div(collateral).times(100).toNumber();

    const pnlPercent = entryPrice.isZero()
      ? 0
      : pnl.div(entryPrice.times(closeSize)).times(100).toNumber();

    return {
      id: closePosition.id,
      positionKeyId: closePosition.positionKey.id,
      asset: closePosition.positionKey.indexAssetId,
      side: closePosition.positionKey.isLong ? 'LONG' : 'SHORT',
      entryPrice: entryPrice.toString(),
      exitPrice: exitPrice.toString(),
      size: closeSize.toString(),
      openTime: openPosition.timestamp,
      closeTime: closePosition.timestamp,
      durationSeconds,
      realizedPnl: closePosition.realizedPnl,
      pnlPercent,
      roe,
      fees: totalFees.toString(),
      fundingPaid: totalFunding.toString(),
      status: closePosition.change === 'LIQUIDATE' ? 'LIQUIDATED' : 'CLOSED',
      collateral: closePosition.collateralAmout,
    };
  }

  private buildTradeFromClosePosition(closePosition: IndexerPosition): TradeHistoryItem {
    const size = new BigNumber(closePosition.size).abs();
    const collateral = new BigNumber(closePosition.collateralAmout);
    const pnl = new BigNumber(closePosition.realizedPnl);

    const roe = collateral.isZero() ? 0 : pnl.div(collateral).times(100).toNumber();

    return {
      id: closePosition.id,
      positionKeyId: closePosition.positionKey.id,
      asset: closePosition.positionKey.indexAssetId,
      side: closePosition.positionKey.isLong ? 'LONG' : 'SHORT',
      entryPrice: '0', 
      exitPrice: '0', 
      size: size.toString(),
      openTime: closePosition.timestamp, 
      closeTime: closePosition.timestamp,
      durationSeconds: 0, 
      realizedPnl: closePosition.realizedPnl,
      pnlPercent: 0, 
      roe,
      fees: closePosition.positionFee,
      fundingPaid: closePosition.realizedFundingRate,
      status: closePosition.change === 'LIQUIDATE' ? 'LIQUIDATED' : 'CLOSED',
      collateral: closePosition.collateralAmout,
    };
  }

  private applyClientSideFilters(
    trades: TradeHistoryItem[],
    filters: TradeFilters
  ): TradeHistoryItem[] {
    let filtered = trades;

    if (filters.minSize) {
      const minSize = new BigNumber(filters.minSize);
      filtered = filtered.filter((t) => new BigNumber(t.size).gte(minSize));
    }

    if (filters.maxSize) {
      const maxSize = new BigNumber(filters.maxSize);
      filtered = filtered.filter((t) => new BigNumber(t.size).lte(maxSize));
    }

    if (filters.profitOnly) {
      filtered = filtered.filter((t) => new BigNumber(t.realizedPnl).isPositive());
    }

    if (filters.lossOnly) {
      filtered = filtered.filter((t) => new BigNumber(t.realizedPnl).isNegative());
    }

    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    return filtered;
  }

  private sortTrades(
    trades: TradeHistoryItem[],
    pagination: PaginationParams
  ): TradeHistoryItem[] {
    const sortBy = pagination.sortBy || 'timestamp';
    const sortOrder = pagination.sortOrder || 'desc';

    const sorted = [...trades].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'timestamp':
          comparison = a.closeTime - b.closeTime;
          break;
        case 'pnl':
          comparison = new BigNumber(a.realizedPnl)
            .minus(b.realizedPnl)
            .toNumber();
          break;
        case 'size':
          comparison = new BigNumber(a.size)
            .minus(b.size)
            .toNumber();
          break;
        case 'duration':
          comparison = a.durationSeconds - b.durationSeconds;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  private calculateAggregates(trades: TradeHistoryItem[]): {
    totalPnl: string;
    totalVolume: string;
    avgPnl: string;
    winRate: number;
  } {
    if (trades.length === 0) {
      return {
        totalPnl: '0',
        totalVolume: '0',
        avgPnl: '0',
        winRate: 0,
      };
    }

    const totalPnl = trades.reduce(
      (sum, t) => sum.plus(t.realizedPnl),
      new BigNumber(0)
    );

    const totalVolume = trades.reduce(
      (sum, t) => sum.plus(new BigNumber(t.size).times(t.exitPrice)),
      new BigNumber(0)
    );

    const avgPnl = totalPnl.div(trades.length);

    const wins = trades.filter((t) => new BigNumber(t.realizedPnl).isPositive()).length;
    const winRate = (wins / trades.length) * 100;

    return {
      totalPnl: totalPnl.toString(),
      totalVolume: totalVolume.toString(),
      avgPnl: avgPnl.toString(),
      winRate,
    };
  }

  async aggregateByPeriod(
    account: string,
    period: AggregationPeriod,
    filters: TradeFilters = {}
  ): Promise<AggregatedTradeStats[]> {
    
    const positions: IndexerPosition[] = [];
    const batchGenerator = this.graphqlClient.getPositionsBatch(account, 100);

    for await (const batch of batchGenerator) {
      positions.push(...batch);
    }

    const closedPositions = positions.filter(
      (p) => p.change === 'CLOSE' || p.change === 'LIQUIDATE'
    );

    let filtered = closedPositions;
    if (filters.dateFrom) {
      filtered = filtered.filter((p) => p.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((p) => p.timestamp <= filters.dateTo!);
    }

    const periodGroups = new Map<string, IndexerPosition[]>();

    for (const position of filtered) {
      const periodKey = this.getPeriodKey(position.timestamp, period);
      if (!periodGroups.has(periodKey)) {
        periodGroups.set(periodKey, []);
      }
      periodGroups.get(periodKey)!.push(position);
    }

    const stats: AggregatedTradeStats[] = [];

    for (const [periodKey, periodPositions] of periodGroups) {
      const [periodStart, periodEnd] = this.getPeriodBounds(periodKey, period);

      const totalPnl = periodPositions.reduce(
        (sum, p) => sum.plus(p.realizedPnl),
        new BigNumber(0)
      );

      const totalVolume = periodPositions.reduce(
        (sum, p) => sum.plus(new BigNumber(p.size).abs()),
        new BigNumber(0)
      );

      const wins = periodPositions.filter((p) =>
        new BigNumber(p.realizedPnl).isPositive()
      ).length;

      const winRate = periodPositions.length > 0
        ? (wins / periodPositions.length) * 100
        : 0;

      const avgPnl = periodPositions.length > 0
        ? totalPnl.div(periodPositions.length)
        : new BigNumber(0);

      const totalFees = periodPositions.reduce(
        (sum, p) => sum.plus(p.positionFee),
        new BigNumber(0)
      );

      stats.push({
        period: periodKey,
        periodStart,
        periodEnd,
        tradeCount: periodPositions.length,
        totalPnl: totalPnl.toString(),
        totalVolume: totalVolume.toString(),
        winRate,
        avgPnl: avgPnl.toString(),
        avgSize: totalVolume.div(periodPositions.length || 1).toString(),
        totalFees: totalFees.toString(),
      });
    }

    stats.sort((a, b) => a.periodStart - b.periodStart);

    return stats;
  }

  private getPeriodKey(timestamp: number, period: AggregationPeriod): string {
    const date = new Date(timestamp);

    switch (period) {
      case 'hour':
        return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}-${date.getUTCHours()}`;
      case 'day':
        return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setUTCDate(date.getUTCDate() - date.getUTCDay());
        return `${weekStart.getUTCFullYear()}-W${Math.ceil(weekStart.getUTCDate() / 7)}`;
      case 'month':
        return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  private getPeriodBounds(periodKey: string, period: AggregationPeriod): [number, number] {
    const parts = periodKey.split('-');

    switch (period) {
      case 'hour': {
        const [year, month, day, hour] = parts.map(Number);
        const start = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0));
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return [start.getTime(), end.getTime()];
      }
      case 'day': {
        const [year, month, day] = parts.map(Number);
        const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        return [start.getTime(), end.getTime()];
      }
      case 'week': {
        
        const [year, week] = parts.map((p) => parseInt(p.replace('W', '')));
        const start = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        return [start.getTime(), end.getTime()];
      }
      case 'month': {
        const [year, month] = parts.map(Number);
        const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        return [start.getTime(), end.getTime()];
      }
      default: {
        const start = new Date(periodKey).getTime();
        return [start, start + 24 * 60 * 60 * 1000];
      }
    }
  }
}

export function createTradeHistoryService(graphqlEndpoint: string): TradeHistoryService {
  return new TradeHistoryService(graphqlEndpoint);
}

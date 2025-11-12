import BigNumber from 'bignumber.js';
import {
  PerformanceMetrics,
  IndexerPosition,
  EquityCurvePoint,
  MaxDrawdownResult,
  TradeHistoryItem,
} from '../types/analytics';

export class AnalyticsService {
  calculatePerformanceMetrics(
    closedPositions: IndexerPosition[],
    equityCurve?: EquityCurvePoint[]
  ): PerformanceMetrics {
    if (closedPositions.length === 0) {
      return this.getEmptyMetrics();
    }

    const pnlMetrics = this.calculatePnLMetrics(closedPositions);
    const winLossStats = this.calculateWinLossStats(closedPositions);
    const riskMetrics = equityCurve
      ? this.calculateRiskMetrics(equityCurve)
      : { sharpeRatio: 0, sortinoRatio: 0, maxDrawdown: 0, maxDrawdownPercent: 0 };
    const tradeStats = this.calculateTradeStats(closedPositions);
    const costMetrics = this.calculateCosts(closedPositions);

    return {
      ...pnlMetrics,
      ...winLossStats,
      ...riskMetrics,
      ...tradeStats,
      ...costMetrics,
    };
  }

  private calculatePnLMetrics(positions: IndexerPosition[]): {
    totalPnl: string;
    totalPnlPercent: number;
    realizedPnl: string;
  } {
    const totalPnl = positions.reduce(
      (sum, pos) => sum.plus(pos.realizedPnl),
      new BigNumber(0)
    );

    const totalCollateral = positions.reduce(
      (sum, pos) => sum.plus(pos.collateralAmout),
      new BigNumber(0)
    );

    const totalPnlPercent = totalCollateral.isZero()
      ? 0
      : totalPnl.div(totalCollateral).times(100).toNumber();

    return {
      totalPnl: totalPnl.toString(),
      totalPnlPercent,
      realizedPnl: totalPnl.toString(),
    };
  }

  private calculateWinLossStats(positions: IndexerPosition[]): {
    winRate: number;
    avgWin: string;
    avgLoss: string;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    breakEvenTrades: number;
    longestWinStreak: number;
    longestLossStreak: number;
    currentStreak: number;
    currentStreakType: 'WIN' | 'LOSS' | 'NONE';
    largestWin: string;
    largestLoss: string;
  } {
    const wins: BigNumber[] = [];
    const losses: BigNumber[] = [];
    let breakEvenCount = 0;

    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let lastWasWin = false;

    let largestWin = new BigNumber(0);
    let largestLoss = new BigNumber(0);

    positions.forEach((pos) => {
      const pnl = new BigNumber(pos.realizedPnl);

      if (pnl.isGreaterThan(0)) {
        wins.push(pnl);
        currentWinStreak++;
        currentLossStreak = 0;
        lastWasWin = true;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
        if (pnl.isGreaterThan(largestWin)) {
          largestWin = pnl;
        }
      } else if (pnl.isLessThan(0)) {
        losses.push(pnl.abs());
        currentLossStreak++;
        currentWinStreak = 0;
        lastWasWin = false;
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
        if (pnl.abs().isGreaterThan(largestLoss)) {
          largestLoss = pnl.abs();
        }
      } else {
        breakEvenCount++;
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    const totalWins = wins.reduce((sum, w) => sum.plus(w), new BigNumber(0));
    const totalLosses = losses.reduce((sum, l) => sum.plus(l), new BigNumber(0));

    const avgWin = wins.length > 0
      ? totalWins.div(wins.length)
      : new BigNumber(0);

    const avgLoss = losses.length > 0
      ? totalLosses.div(losses.length)
      : new BigNumber(0);

    const profitFactor = totalLosses.isZero()
      ? (wins.length > 0 ? Infinity : 0)
      : totalWins.div(totalLosses).toNumber();

    const winRate = positions.length > 0
      ? (wins.length / positions.length) * 100
      : 0;

    return {
      winRate,
      avgWin: avgWin.toString(),
      avgLoss: avgLoss.toString(),
      profitFactor,
      totalTrades: positions.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      breakEvenTrades: breakEvenCount,
      longestWinStreak,
      longestLossStreak,
      currentStreak: lastWasWin ? currentWinStreak : currentLossStreak,
      currentStreakType: currentWinStreak > 0
        ? 'WIN'
        : currentLossStreak > 0
        ? 'LOSS'
        : 'NONE',
      largestWin: largestWin.toString(),
      largestLoss: largestLoss.toString(),
    };
  }

  private calculateRiskMetrics(equityCurve: EquityCurvePoint[]): {
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
  } {
    const sharpeRatio = this.calculateSharpeRatio(equityCurve);
    const sortinoRatio = this.calculateSortinoRatio(equityCurve);
    const maxDrawdownResult = this.calculateMaxDrawdown(equityCurve);

    return {
      sharpeRatio,
      sortinoRatio,
      maxDrawdown: maxDrawdownResult.maxDrawdown,
      maxDrawdownPercent: maxDrawdownResult.maxDrawdownPercent,
    };
  }

  calculateSharpeRatio(
    equityCurve: EquityCurvePoint[],
    riskFreeRate: number = 0
  ): number {
    if (equityCurve.length < 2) {
      return 0;
    }

    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prevEquity = equityCurve[i - 1].equity;
      const currEquity = equityCurve[i].equity;
      
      if (prevEquity !== 0) {
        const returnRate = (currEquity - prevEquity) / prevEquity;
        returns.push(returnRate);
      }
    }

    if (returns.length === 0) {
      return 0;
    }

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    const variance = returns.reduce((sum, r) => {
      const diff = r - meanReturn;
      return sum + diff * diff;
    }, 0) / returns.length;

    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return 0;
    }

    const avgTimeDiff = this.calculateAvgTimeDiff(equityCurve);
    const periodsPerYear = (365 * 24 * 60 * 60 * 1000) / avgTimeDiff;
    
    const annualizedReturn = meanReturn * periodsPerYear;
    const annualizedStdDev = stdDev * Math.sqrt(periodsPerYear);

    return (annualizedReturn - riskFreeRate) / annualizedStdDev;
  }

  calculateSortinoRatio(
    equityCurve: EquityCurvePoint[],
    targetReturn: number = 0
  ): number {
    if (equityCurve.length < 2) {
      return 0;
    }

    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prevEquity = equityCurve[i - 1].equity;
      const currEquity = equityCurve[i].equity;
      
      if (prevEquity !== 0) {
        const returnRate = (currEquity - prevEquity) / prevEquity;
        returns.push(returnRate);
      }
    }

    if (returns.length === 0) {
      return 0;
    }

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    const downsideReturns = returns.filter((r) => r < targetReturn);
    
    if (downsideReturns.length === 0) {
      return Infinity;
    }

    const downsideVariance = downsideReturns.reduce((sum, r) => {
      const diff = r - targetReturn;
      return sum + diff * diff;
    }, 0) / returns.length;

    const downsideStdDev = Math.sqrt(downsideVariance);

    if (downsideStdDev === 0) {
      return 0;
    }

    const avgTimeDiff = this.calculateAvgTimeDiff(equityCurve);
    const periodsPerYear = (365 * 24 * 60 * 60 * 1000) / avgTimeDiff;
    
    const annualizedReturn = meanReturn * periodsPerYear;
    const annualizedDownsideStdDev = downsideStdDev * Math.sqrt(periodsPerYear);

    return (annualizedReturn - targetReturn) / annualizedDownsideStdDev;
  }

  calculateMaxDrawdown(equityCurve: EquityCurvePoint[]): MaxDrawdownResult {
    if (equityCurve.length === 0) {
      return {
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        peakValue: 0,
        troughValue: 0,
        peakTimestamp: 0,
        troughTimestamp: 0,
        currentDrawdown: 0,
      };
    }

    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let peak = equityCurve[0].equity;
    let peakTimestamp = equityCurve[0].timestamp;
    let trough = peak;
    let troughTimestamp = peakTimestamp;
    let maxDrawdownPeak = peak;
    let maxDrawdownTrough = peak;
    let maxDrawdownPeakTimestamp = peakTimestamp;
    let maxDrawdownTroughTimestamp = peakTimestamp;
    let recoveryTimestamp: number | undefined;

    for (const point of equityCurve) {
      const equity = point.equity;

      if (equity > peak) {
        peak = equity;
        peakTimestamp = point.timestamp;
        trough = equity;
        troughTimestamp = point.timestamp;
      } else if (equity < trough) {
        trough = equity;
        troughTimestamp = point.timestamp;
      }

      const drawdown = peak - trough;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
        maxDrawdownPeak = peak;
        maxDrawdownTrough = trough;
        maxDrawdownPeakTimestamp = peakTimestamp;
        maxDrawdownTroughTimestamp = troughTimestamp;
        recoveryTimestamp = undefined;
      } else if (equity >= maxDrawdownPeak && recoveryTimestamp === undefined) {
        recoveryTimestamp = point.timestamp;
      }
    }

    const currentEquity = equityCurve[equityCurve.length - 1].equity;
    const currentDrawdown = peak - currentEquity;

    return {
      maxDrawdown,
      maxDrawdownPercent,
      peakValue: maxDrawdownPeak,
      troughValue: maxDrawdownTrough,
      peakTimestamp: maxDrawdownPeakTimestamp,
      troughTimestamp: maxDrawdownTroughTimestamp,
      recoveryTimestamp,
      currentDrawdown,
    };
  }

  private calculateTradeStats(positions: IndexerPosition[]): {
    avgTradeDurationSeconds: number;
    avgPositionSize: string;
  } {
    const sizes = positions.map((pos) => new BigNumber(pos.size).abs());
    const avgSize = sizes.length > 0
      ? sizes.reduce((sum, s) => sum.plus(s), new BigNumber(0)).div(sizes.length)
      : new BigNumber(0);

    return {
      avgTradeDurationSeconds: 0,
      avgPositionSize: avgSize.toString(),
    };
  }

  private calculateCosts(positions: IndexerPosition[]): {
    totalFees: string;
    netFunding: string;
    avgFeePerTrade: string;
  } {
    const totalFees = positions.reduce(
      (sum, pos) => sum.plus(pos.positionFee),
      new BigNumber(0)
    );

    const netFunding = positions.reduce(
      (sum, pos) => sum.plus(pos.realizedFundingRate),
      new BigNumber(0)
    );

    const avgFeePerTrade = positions.length > 0
      ? totalFees.div(positions.length)
      : new BigNumber(0);

    return {
      totalFees: totalFees.toString(),
      netFunding: netFunding.toString(),
      avgFeePerTrade: avgFeePerTrade.toString(),
    };
  }

  private calculateAvgTimeDiff(equityCurve: EquityCurvePoint[]): number {
    if (equityCurve.length < 2) {
      return 1;
    }

    let totalDiff = 0;
    for (let i = 1; i < equityCurve.length; i++) {
      totalDiff += equityCurve[i].timestamp - equityCurve[i - 1].timestamp;
    }

    return totalDiff / (equityCurve.length - 1);
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalPnl: '0',
      totalPnlPercent: 0,
      realizedPnl: '0',
      winRate: 0,
      avgWin: '0',
      avgLoss: '0',
      profitFactor: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      currentStreak: 0,
      currentStreakType: 'NONE',
      avgTradeDurationSeconds: 0,
      avgPositionSize: '0',
      largestWin: '0',
      largestLoss: '0',
      totalFees: '0',
      netFunding: '0',
      avgFeePerTrade: '0',
    };
  }

  buildEquityCurveFromPositions(
    positions: IndexerPosition[],
    initialEquity: number = 0
  ): EquityCurvePoint[] {
    const sortedPositions = [...positions].sort((a, b) => a.timestamp - b.timestamp);
    
    const curve: EquityCurvePoint[] = [
      {
        timestamp: sortedPositions[0]?.timestamp || Date.now(),
        equity: initialEquity,
        cumulativePnl: 0,
      },
    ];

    let cumulativePnl = 0;

    for (const position of sortedPositions) {
      const pnl = new BigNumber(position.realizedPnl).toNumber();
      cumulativePnl += pnl;
      
      curve.push({
        timestamp: position.timestamp,
        equity: initialEquity + cumulativePnl,
        cumulativePnl,
      });
    }

    return curve;
  }
}

export const analyticsService = new AnalyticsService();

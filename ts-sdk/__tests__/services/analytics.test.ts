import { AnalyticsService } from '../../src/services/analytics';
import { IndexerPosition, EquityCurvePoint } from '../../src/types/analytics';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  describe('calculatePerformanceMetrics', () => {
    it('should return empty metrics for no positions', () => {
      const metrics = service.calculatePerformanceMetrics([]);
      
      expect(metrics.totalTrades).toBe(0);
      expect(metrics.totalPnl).toBe('0');
      expect(metrics.winRate).toBe(0);
    });

    it('should calculate correct win rate', () => {
      const positions: IndexerPosition[] = [
        createMockPosition('100'),  
        createMockPosition('-50'),  
        createMockPosition('75'),   
        createMockPosition('200'),  
      ];

      const metrics = service.calculatePerformanceMetrics(positions);
      
      expect(metrics.totalTrades).toBe(4);
      expect(metrics.winningTrades).toBe(3);
      expect(metrics.losingTrades).toBe(1);
      expect(metrics.winRate).toBe(75);
    });

    it('should calculate profit factor correctly', () => {
      const positions: IndexerPosition[] = [
        createMockPosition('300'),  
        createMockPosition('-100'), 
      ];

      const metrics = service.calculatePerformanceMetrics(positions);
      
      expect(metrics.profitFactor).toBe(3); 
    });

    it('should handle all winning trades', () => {
      const positions: IndexerPosition[] = [
        createMockPosition('100'),
        createMockPosition('200'),
        createMockPosition('150'),
      ];

      const metrics = service.calculatePerformanceMetrics(positions);
      
      expect(metrics.winRate).toBe(100);
      expect(metrics.losingTrades).toBe(0);
      expect(metrics.profitFactor).toBe(Infinity);
    });

    it('should calculate longest win/loss streaks', () => {
      const positions: IndexerPosition[] = [
        createMockPosition('100'),  
        createMockPosition('50'),   
        createMockPosition('75'),   
        createMockPosition('-50'),  
        createMockPosition('100'),  
        createMockPosition('-25'),  
        createMockPosition('-30'),  
      ];

      const metrics = service.calculatePerformanceMetrics(positions);
      
      expect(metrics.longestWinStreak).toBe(3);
      expect(metrics.longestLossStreak).toBe(2);
    });
  });

  describe('calculateSharpeRatio', () => {
    it('should return 0 for insufficient data', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 1000, equity: 10000, cumulativePnl: 0 },
      ];

      const sharpeRatio = service.calculateSharpeRatio(equityCurve);
      
      expect(sharpeRatio).toBe(0);
    });

    it('should calculate positive Sharpe ratio for profitable trading', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 86400000, equity: 10100, cumulativePnl: 100 },
        { timestamp: 172800000, equity: 10250, cumulativePnl: 250 },
        { timestamp: 259200000, equity: 10400, cumulativePnl: 400 },
        { timestamp: 345600000, equity: 10600, cumulativePnl: 600 },
      ];

      const sharpeRatio = service.calculateSharpeRatio(equityCurve);
      
      expect(sharpeRatio).toBeGreaterThan(0);
      // For consistent positive returns with low volatility, Sharpe ratio can be very high
      expect(sharpeRatio).toBeGreaterThan(10);
      expect(sharpeRatio).toBeLessThan(200); 
    });

    it('should calculate negative Sharpe ratio for losing trading', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 86400000, equity: 9900, cumulativePnl: -100 },
        { timestamp: 172800000, equity: 9750, cumulativePnl: -250 },
        { timestamp: 259200000, equity: 9600, cumulativePnl: -400 },
      ];

      const sharpeRatio = service.calculateSharpeRatio(equityCurve);
      
      expect(sharpeRatio).toBeLessThan(0);
    });

    it('should return 0 for zero volatility', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 86400000, equity: 10000, cumulativePnl: 0 },
        { timestamp: 172800000, equity: 10000, cumulativePnl: 0 },
      ];

      const sharpeRatio = service.calculateSharpeRatio(equityCurve);
      
      expect(sharpeRatio).toBe(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should return 0 for empty equity curve', () => {
      const result = service.calculateMaxDrawdown([]);
      
      expect(result.maxDrawdown).toBe(0);
      expect(result.maxDrawdownPercent).toBe(0);
    });

    it('should calculate max drawdown correctly', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 1, equity: 12000, cumulativePnl: 2000 },  
        { timestamp: 2, equity: 11000, cumulativePnl: 1000 },
        { timestamp: 3, equity: 9000, cumulativePnl: -1000 },  
        { timestamp: 4, equity: 10000, cumulativePnl: 0 },
      ];

      const result = service.calculateMaxDrawdown(equityCurve);
      
      expect(result.maxDrawdown).toBe(3000); 
      expect(result.maxDrawdownPercent).toBeCloseTo(25, 1); 
      expect(result.peakValue).toBe(12000);
      expect(result.troughValue).toBe(9000);
    });

    it('should handle only increasing equity', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 1, equity: 11000, cumulativePnl: 1000 },
        { timestamp: 2, equity: 12000, cumulativePnl: 2000 },
        { timestamp: 3, equity: 13000, cumulativePnl: 3000 },
      ];

      const result = service.calculateMaxDrawdown(equityCurve);
      
      expect(result.maxDrawdown).toBe(0);
      expect(result.maxDrawdownPercent).toBe(0);
    });

    it('should track current drawdown', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 1, equity: 12000, cumulativePnl: 2000 },
        { timestamp: 2, equity: 11000, cumulativePnl: 1000 },  
      ];

      const result = service.calculateMaxDrawdown(equityCurve);
      
      expect(result.currentDrawdown).toBe(1000); 
    });
  });

  describe('calculateSortinoRatio', () => {
    it('should calculate Sortino ratio', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 86400000, equity: 10200, cumulativePnl: 200 },
        { timestamp: 172800000, equity: 10100, cumulativePnl: 100 },
        { timestamp: 259200000, equity: 10300, cumulativePnl: 300 },
        { timestamp: 345600000, equity: 10250, cumulativePnl: 250 },
      ];

      const sortinoRatio = service.calculateSortinoRatio(equityCurve);
      
      expect(sortinoRatio).toBeGreaterThan(0);
    });

    it('should return Infinity for no downside deviation', () => {
      const equityCurve: EquityCurvePoint[] = [
        { timestamp: 0, equity: 10000, cumulativePnl: 0 },
        { timestamp: 86400000, equity: 10100, cumulativePnl: 100 },
        { timestamp: 172800000, equity: 10200, cumulativePnl: 200 },
      ];

      const sortinoRatio = service.calculateSortinoRatio(equityCurve);
      
      expect(sortinoRatio).toBe(Infinity);
    });
  });

  describe('buildEquityCurveFromPositions', () => {
    it('should build equity curve from positions', () => {
      const positions: IndexerPosition[] = [
        { ...createMockPosition('100'), timestamp: 1000 },
        { ...createMockPosition('-50'), timestamp: 2000 },
        { ...createMockPosition('75'), timestamp: 3000 },
      ];

      const curve = service.buildEquityCurveFromPositions(positions, 10000);
      
      expect(curve).toHaveLength(4); 
      expect(curve[0].equity).toBe(10000);
      expect(curve[1].equity).toBe(10100);
      expect(curve[2].equity).toBe(10050);
      expect(curve[3].equity).toBe(10125);
    });

    it('should handle empty positions', () => {
      const curve = service.buildEquityCurveFromPositions([], 10000);
      
      expect(curve).toHaveLength(1);
      expect(curve[0].equity).toBe(10000);
    });
  });
});

function createMockPosition(realizedPnl: string): IndexerPosition {
  return {
    id: `pos-${Math.random()}`,
    positionKey: {
      id: 'key-1',
      account: 'account-1',
      indexAssetId: 'BTC-USD',
      isLong: true,
    },
    collateralAmout: '1000',
    size: '10',
    timestamp: Date.now(),
    latest: false,
    change: 'CLOSE',
    collateralTransferred: '0',
    positionFee: '10',
    fundingRate: '0',
    pnlDelta: '0',
    realizedFundingRate: '0',
    realizedPnl,
  };
}

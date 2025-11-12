import {
    AnalyticsService,
    IndexerClient,
    Network,
} from '../src/index';

async function main() {
  
  const indexerClient = new IndexerClient(
    Network.testnet().indexerConfig,
    10000,
    'http:
  );

  const analyticsService = new AnalyticsService();

  const account = 'fuel1...'; 

  try {
    console.log('Fetching closed positions...');

    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const now = Math.floor(Date.now() / 1000);

    const closedPositions = await indexerClient.positionsGraphql?.getClosedPositions(
      account,
      {
        dateFrom: thirtyDaysAgo,
        dateTo: now,
      },
      {
        limit: 1000,
        offset: 0,
      }
    );

    if (!closedPositions || closedPositions.length === 0) {
      console.log('No closed positions found');
      return;
    }

    console.log(`Found ${closedPositions.length} closed positions`);

    console.log('\nCalculating performance metrics...');

    const metrics = analyticsService.calculatePerformanceMetrics(closedPositions);

    console.log('\n=== PERFORMANCE METRICS ===\n');

    console.log('P&L METRICS:');
    console.log(`  Total P&L: ${metrics.totalPnl}`);
    console.log(`  Total P&L %: ${metrics.totalPnlPercent.toFixed(2)}%`);
    console.log(`  Total Fees: ${metrics.totalFees}`);
    console.log(`  Net Funding: ${metrics.netFunding}`);

    console.log('\nWIN/LOSS STATISTICS:');
    console.log(`  Win Rate: ${metrics.winRate.toFixed(2)}%`);
    console.log(`  Total Trades: ${metrics.totalTrades}`);
    console.log(`  Winning Trades: ${metrics.winningTrades}`);
    console.log(`  Losing Trades: ${metrics.losingTrades}`);
    console.log(`  Break Even Trades: ${metrics.breakEvenTrades}`);
    console.log(`  Avg Win: ${metrics.avgWin}`);
    console.log(`  Avg Loss: ${metrics.avgLoss}`);
    console.log(`  Profit Factor: ${metrics.profitFactor.toFixed(2)}`);
    console.log(`  Largest Win: ${metrics.largestWin}`);
    console.log(`  Largest Loss: ${metrics.largestLoss}`);

    console.log('\nSTREAK STATISTICS:');
    console.log(`  Longest Win Streak: ${metrics.longestWinStreak}`);
    console.log(`  Longest Loss Streak: ${metrics.longestLossStreak}`);
    console.log(`  Current Streak: ${metrics.currentStreak} ${metrics.currentStreakType}`);

    console.log('\nTRADE STATISTICS:');
    console.log(`  Avg Position Size: ${metrics.avgPositionSize}`);
    console.log(`  Avg Fee Per Trade: ${metrics.avgFeePerTrade}`);

    console.log('\n=== RISK METRICS ===\n');

    const equityCurve = analyticsService.buildEquityCurveFromPositions(
      closedPositions,
      10000 
    );

    const metricsWithRisk = analyticsService.calculatePerformanceMetrics(
      closedPositions,
      equityCurve
    );

    console.log('RISK-ADJUSTED RETURNS:');
    console.log(`  Sharpe Ratio: ${metricsWithRisk.sharpeRatio.toFixed(3)}`);
    console.log(`  Sortino Ratio: ${metricsWithRisk.sortinoRatio.toFixed(3)}`);

    console.log('\nDRAWDOWN ANALYSIS:');
    console.log(`  Max Drawdown: ${metricsWithRisk.maxDrawdown.toFixed(2)}`);
    console.log(`  Max Drawdown %: ${metricsWithRisk.maxDrawdownPercent.toFixed(2)}%`);

    const maxDrawdownDetails = analyticsService.calculateMaxDrawdown(equityCurve);
    console.log('\nDRAWDOWN DETAILS:');
    console.log(`  Peak Value: ${maxDrawdownDetails.peakValue.toFixed(2)}`);
    console.log(`  Trough Value: ${maxDrawdownDetails.troughValue.toFixed(2)}`);
    console.log(`  Peak Time: ${new Date(maxDrawdownDetails.peakTimestamp).toISOString()}`);
    console.log(`  Trough Time: ${new Date(maxDrawdownDetails.troughTimestamp).toISOString()}`);
    if (maxDrawdownDetails.recoveryTimestamp) {
      console.log(`  Recovery Time: ${new Date(maxDrawdownDetails.recoveryTimestamp).toISOString()}`);
    } else {
      console.log('  Recovery: Not yet recovered');
    }
    console.log(`  Current Drawdown: ${maxDrawdownDetails.currentDrawdown.toFixed(2)}`);

  } catch (error) {
    console.error('Error calculating metrics:', error);
  }
}

main().catch(console.error);

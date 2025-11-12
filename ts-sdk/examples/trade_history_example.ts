import { TradeHistoryService } from '../src/index';

async function main() {
  
  const tradeHistoryService = new TradeHistoryService('http:

  const account = 'fuel1...'; 

  try {
    console.log('Querying trade history...\n');

    const recentTrades = await tradeHistoryService.getTradeHistory(
      account,
      {
        dateFrom: Date.now() - 7 * 24 * 60 * 60 * 1000, 
        dateTo: Date.now(),
      },
      {
        limit: 25,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'desc',
      }
    );

    console.log('=== RECENT TRADES (Last 7 days) ===\n');
    console.log(`Total Trades: ${recentTrades.totalCount}`);
    console.log(`Page: ${recentTrades.pagination.currentPage + 1} of ${recentTrades.pagination.totalPages}`);
    console.log(`\nAggregates:`);
    console.log(`  Total P&L: ${recentTrades.aggregates.totalPnl}`);
    console.log(`  Win Rate: ${recentTrades.aggregates.winRate.toFixed(2)}%`);
    console.log(`  Avg P&L: ${recentTrades.aggregates.avgPnl}`);

    console.log('\nTrades:');
    recentTrades.trades.forEach((trade, i) => {
      console.log(`\n${i + 1}. ${trade.asset} ${trade.side}`);
      console.log(`   Entry: ${trade.entryPrice} | Exit: ${trade.exitPrice}`);
      console.log(`   Size: ${trade.size}`);
      console.log(`   P&L: ${trade.realizedPnl} (${trade.pnlPercent.toFixed(2)}%)`);
      console.log(`   ROE: ${trade.roe.toFixed(2)}%`);
      console.log(`   Duration: ${Math.floor(trade.durationSeconds / 60)} minutes`);
      console.log(`   Status: ${trade.status}`);
    });

    console.log('\n\n=== PROFITABLE BTC TRADES ===\n');

    const profitableBtc = await tradeHistoryService.getTradeHistory(
      account,
      {
        asset: 'BTC-USD',
        profitOnly: true,
      },
      {
        limit: 10,
        offset: 0,
        sortBy: 'pnl',
        sortOrder: 'desc',
      }
    );

    console.log(`Total Profitable BTC Trades: ${profitableBtc.totalCount}`);
    profitableBtc.trades.forEach((trade, i) => {
      console.log(`${i + 1}. ${trade.side} ${trade.size} @ ${trade.entryPrice} → ${trade.exitPrice}`);
      console.log(`   P&L: ${trade.realizedPnl}`);
    });

    console.log('\n\n=== LIQUIDATIONS ===\n');

    const liquidations = await tradeHistoryService.getTradeHistory(
      account,
      {
        status: 'LIQUIDATED',
      },
      {
        limit: 10,
        offset: 0,
      }
    );

    console.log(`Total Liquidations: ${liquidations.totalCount}`);
    if (liquidations.totalCount > 0) {
      liquidations.trades.forEach((trade, i) => {
        console.log(`${i + 1}. ${trade.asset} ${trade.side}`);
        console.log(`   Size: ${trade.size}`);
        console.log(`   Loss: ${trade.realizedPnl}`);
        console.log(`   Time: ${new Date(trade.closeTime).toISOString()}`);
      });
    } else {
      console.log('No liquidations found');
    }

    console.log('\n\n=== DAILY AGGREGATED STATS ===\n');

    const dailyStats = await tradeHistoryService.aggregateByPeriod(
      account,
      'day',
      {
        dateFrom: Date.now() - 30 * 24 * 60 * 60 * 1000, 
      }
    );

    console.log(`Days with trading activity: ${dailyStats.length}`);
    dailyStats.slice(0, 10).forEach((stat) => {
      console.log(`\n${stat.period}:`);
      console.log(`  Trades: ${stat.tradeCount}`);
      console.log(`  P&L: ${stat.totalPnl}`);
      console.log(`  Win Rate: ${stat.winRate.toFixed(2)}%`);
      console.log(`  Volume: ${stat.totalVolume}`);
    });

    console.log('\n\n=== PAGINATION EXAMPLE ===\n');

    const page1 = await tradeHistoryService.getTradeHistory(
      account,
      {},
      { limit: 10, offset: 0 }
    );

    console.log(`Page 1 of ${page1.pagination.totalPages}`);
    console.log(`Showing ${page1.trades.length} trades`);
    console.log(`Has next page: ${page1.pagination.hasNextPage}`);

    if (page1.pagination.hasNextPage) {
      const page2 = await tradeHistoryService.getTradeHistory(
        account,
        {},
        { limit: 10, offset: 10 }
      );
      console.log(`\nPage 2 of ${page2.pagination.totalPages}`);
      console.log(`Showing ${page2.trades.length} trades`);
    }

  } catch (error) {
    console.error('Error querying trade history:', error);
  }
}

main().catch(console.error);

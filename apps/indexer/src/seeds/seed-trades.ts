#!/usr/bin/env tsx

import 'reflect-metadata';
import { initializeDatabase, closeDatabase } from '../db/data-source';
import { Market } from '../model/generated/market.model';
import { Trade } from '../model/generated/trade.model';
import { generateTrades, generateDefaultTradeSpecs } from './generators/trade-generator';
import { getAllMarketTickers } from './generators/market-generator';

/**
 * Seed trades into the database.
 */
async function seedTrades() {
  console.log('[Seed] Starting trade seeding...');
  
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    const marketRepo = dataSource.getRepository(Market);
    const tradeRepo = dataSource.getRepository(Trade);
    
    // Load markets
    const markets = await marketRepo.find();
    
    if (markets.length === 0) {
      throw new Error('No markets found. Please run seed-markets first.');
    }
    
    console.log(`[Seed] Found ${markets.length} markets`);
    
    // Create market map for quick lookup
    const marketMap = new Map(markets.map(m => [m.id, m]));
    
    // Generate trades for each market
    const tickers = getAllMarketTickers();
    let allTrades: Trade[] = [];
    
    for (const ticker of tickers) {
      const tradeSpecs = generateDefaultTradeSpecs(ticker, 50); // 50 trades per market
      const trades = generateTrades(tradeSpecs, marketMap);
      allTrades = allTrades.concat(trades);
    }
    
    console.log(`[Seed] Generated ${allTrades.length} trades`);
    
    // Insert new trades (clearing is handled by clean-db script)
    await tradeRepo.save(allTrades);
    console.log(`[Seed] ✓ Inserted ${allTrades.length} trades`);
    
    // Display summary by market
    tickers.forEach(ticker => {
      const count = allTrades.filter(t => t.market?.ticker === ticker).length;
      console.log(`  - ${ticker}: ${count} trades`);
    });
    
    await closeDatabase();
    console.log('[Seed] ✓ Trade seeding complete');
  } catch (error) {
    console.error('[Seed] ✗ Trade seeding failed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedTrades();
}

export { seedTrades };


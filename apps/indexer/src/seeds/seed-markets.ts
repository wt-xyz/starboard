#!/usr/bin/env tsx

import 'reflect-metadata';
import { initializeDatabase, closeDatabase } from '../db/data-source';
import { Market } from '../model/generated/market.model';
import { generateMarkets } from './generators/market-generator';

/**
 * Seed markets into the database.
 */
async function seedMarkets() {
  console.log('[Seed] Starting market seeding...');
  
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    const marketRepo = dataSource.getRepository(Market);
    
    // Generate markets
    const markets = generateMarkets();
    console.log(`[Seed] Generated ${markets.length} markets`);
    
    // Insert new markets (clearing is handled by clean-db script)
    await marketRepo.save(markets);
    console.log(`[Seed] ✓ Inserted ${markets.length} markets`);
    
    // Display summary
    markets.forEach(market => {
      console.log(`  - ${market.ticker} (${market.id})`);
    });
    
    await closeDatabase();
    console.log('[Seed] ✓ Market seeding complete');
  } catch (error) {
    console.error('[Seed] ✗ Market seeding failed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedMarkets();
}

export { seedMarkets };


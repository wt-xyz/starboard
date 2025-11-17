#!/usr/bin/env tsx

import 'reflect-metadata';
import { initializeDatabase, closeDatabase } from '../db/data-source';
import { Account } from '../model/generated/account.model';
import { Market } from '../model/generated/market.model';
import { Position } from '../model/generated/position.model';
import { generatePositions, generateDefaultPositionSpecs } from './generators/position-generator';
import { getAllAccountAddresses } from './generators/account-generator';
import { getAllMarketTickers } from './generators/market-generator';

/**
 * Seed positions into the database.
 */
async function seedPositions() {
  console.log('[Seed] Starting position seeding...');
  
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    const accountRepo = dataSource.getRepository(Account);
    const marketRepo = dataSource.getRepository(Market);
    const positionRepo = dataSource.getRepository(Position);
    
    // Load accounts and markets
    const accounts = await accountRepo.find();
    const markets = await marketRepo.find();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please run seed-accounts first.');
    }
    if (markets.length === 0) {
      throw new Error('No markets found. Please run seed-markets first.');
    }
    
    console.log(`[Seed] Found ${accounts.length} accounts and ${markets.length} markets`);
    
    // Create maps for quick lookup
    const accountMap = new Map(accounts.map(a => [a.id, a]));
    const marketMap = new Map(markets.map(m => [m.id, m]));
    
    // Generate position specs
    const accountAddresses = getAllAccountAddresses();
    const tickers = getAllMarketTickers();
    const positionSpecs = generateDefaultPositionSpecs(accountAddresses, tickers);
    
    // Generate positions
    const positions = generatePositions(positionSpecs, accountMap, marketMap);
    console.log(`[Seed] Generated ${positions.length} positions`);
    
    // Insert new positions (clearing is handled by clean-db script)
    await positionRepo.save(positions);
    console.log(`[Seed] ✓ Inserted ${positions.length} positions`);
    
    // Display summary
    const openCount = positions.filter(p => p.status === 'OPEN').length;
    const closedCount = positions.filter(p => p.status === 'CLOSED').length;
    console.log(`  - Open: ${openCount}`);
    console.log(`  - Closed: ${closedCount}`);
    
    await closeDatabase();
    console.log('[Seed] ✓ Position seeding complete');
  } catch (error) {
    console.error('[Seed] ✗ Position seeding failed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedPositions();
}

export { seedPositions };


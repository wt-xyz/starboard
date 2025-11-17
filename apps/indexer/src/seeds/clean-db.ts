#!/usr/bin/env tsx

import 'reflect-metadata';
import { initializeDatabase, closeDatabase } from '../db/data-source';
import { Account } from '../model/generated/account.model';
import { Market } from '../model/generated/market.model';
import { Position } from '../model/generated/position.model';
import { Trade } from '../model/generated/trade.model';
import { Payment } from '../model/generated/payment.model';

/**
 * Clean all data from the database.
 * Useful for starting fresh.
 */
async function cleanDatabase() {
  console.log('[Clean] Starting database cleanup...');
  
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    
    // Get repositories
    const paymentRepo = dataSource.getRepository(Payment);
    const tradeRepo = dataSource.getRepository(Trade);
    const positionRepo = dataSource.getRepository(Position);
    const accountRepo = dataSource.getRepository(Account);
    const marketRepo = dataSource.getRepository(Market);
    
    // Use TRUNCATE CASCADE to handle foreign key constraints
    console.log('[Clean] Truncating all tables with CASCADE...');
    await dataSource.query('TRUNCATE TABLE payment, trade, position, account, market CASCADE;');
    
    await closeDatabase();
    console.log('[Clean] ✓ Database cleanup complete');
  } catch (error) {
    console.error('[Clean] ✗ Database cleanup failed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  cleanDatabase();
}

export { cleanDatabase };


#!/usr/bin/env tsx

import 'reflect-metadata';
import { closeDatabase, initializeDatabase } from '../db/data-source';
import { Account } from '../model/generated/account.model';
import { generateAccounts } from './generators/account-generator';

/**
 * Seed accounts into the database.
 */
async function seedAccounts() {
  console.log('[Seed] Starting account seeding...');
  
  try {
    // Initialize database connection
    const dataSource = await initializeDatabase();
    const accountRepo = dataSource.getRepository(Account);
    
    // Generate accounts
    const accounts = generateAccounts();
    console.log(`[Seed] Generated ${accounts.length} accounts`);
    
    // Insert new accounts (clearing is handled by clean-db script)
    await accountRepo.save(accounts);
    console.log(`[Seed] ✓ Inserted ${accounts.length} accounts`);
    
    // Display summary
    accounts.forEach(account => {
      console.log(`  - ${account.address} (sub: ${account.subaccountNumber})`);
    });
    
    await closeDatabase();
    console.log('[Seed] ✓ Account seeding complete');
  } catch (error) {
    console.error('[Seed] ✗ Account seeding failed:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAccounts();
}

export { seedAccounts };


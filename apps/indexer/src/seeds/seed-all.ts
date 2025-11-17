#!/usr/bin/env tsx

import 'reflect-metadata';
import { seedMarkets } from './seed-markets';
import { seedAccounts } from './seed-accounts';
import { seedPositions } from './seed-positions';
import { seedTrades } from './seed-trades';

/**
 * Seed all entities into the database in the correct order.
 * Order matters due to foreign key relationships.
 */
async function seedAll() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Starboard Indexer Database Seeding   ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  try {
    // Seed in order: markets → accounts → positions → trades
    await seedMarkets();
    console.log('');
    
    await seedAccounts();
    console.log('');
    
    await seedPositions();
    console.log('');
    
    await seedTrades();
    console.log('');
    
    console.log('╔════════════════════════════════════════╗');
    console.log('║  ✓ All seeding complete!              ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('You can now start the mock server in database mode:');
    console.log('  MOCK_DATA_SOURCE=database pnpm dev');
    console.log('');
  } catch (error) {
    console.error('\n✗ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll();
}

export { seedAll };


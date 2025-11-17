import { InMemoryMockProvider } from './InMemoryMockProvider';
import { MockDataProvider } from './MockDataProvider.interface';

type MockDataSource = 'memory' | 'database';

/**
 * Creates a mock data provider based on the MOCK_DATA_SOURCE environment variable.
 * 
 * Modes:
 * - 'memory' (default): Fast, deterministic, in-memory mocks. No Docker required.
 * - 'database': Persistent mocks backed by PostgreSQL via TypeORM.
 * 
 * @returns MockDataProvider instance (initialized if database mode)
 */
export async function createMockDataProvider(): Promise<MockDataProvider> {
  const dataSource = (process.env.MOCK_DATA_SOURCE || 'memory').toLowerCase() as MockDataSource;

  switch (dataSource) {
    case 'database':
      console.log('[MockDataProvider] Using database-backed mock data provider');
      // Dynamic import to avoid loading TypeORM entities in memory mode
      const { DatabaseMockProvider } = await import('./DatabaseMockProvider');
      const dbProvider = new DatabaseMockProvider();
      await dbProvider.initialize();
      return dbProvider;
    
    case 'memory':
    default:
      if (dataSource !== 'memory') {
        console.warn(`[MockDataProvider] Unknown data source '${dataSource}', falling back to 'memory'`);
      }
      console.log('[MockDataProvider] Using in-memory mock data provider (fast, stateless)');
      return new InMemoryMockProvider();
  }
}

// Export types and classes for direct usage if needed
export { InMemoryMockProvider } from './InMemoryMockProvider';
export { MockDataProvider } from './MockDataProvider.interface';
// DatabaseMockProvider is exported lazily to avoid loading TypeORM in memory mode



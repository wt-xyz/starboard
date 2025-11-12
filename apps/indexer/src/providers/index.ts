import { DatabaseMockProvider } from './DatabaseMockProvider';
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
 * @returns MockDataProvider instance
 */
export function createMockDataProvider(): MockDataProvider {
  const dataSource = (process.env.MOCK_DATA_SOURCE || 'memory').toLowerCase() as MockDataSource;

  switch (dataSource) {
    case 'database':
      console.log('[MockDataProvider] Using database-backed mock data provider');
      return new DatabaseMockProvider();
    
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
export { MockDataProvider } from './MockDataProvider.interface';
export { InMemoryMockProvider } from './InMemoryMockProvider';
export { DatabaseMockProvider } from './DatabaseMockProvider';


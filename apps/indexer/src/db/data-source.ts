import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Account } from '../model/generated/account.model';
import { Market } from '../model/generated/market.model';
import { Position } from '../model/generated/position.model';
import { Trade } from '../model/generated/trade.model';
import { Payment } from '../model/generated/payment.model';
import { Asset } from '../model/generated/asset.model';

// Load environment variables
dotenv.config();

/**
 * TypeORM DataSource for mock database provider.
 * Connects to PostgreSQL for persistent mock data storage.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'starboard_indexer',
  synchronize: true, // Auto-create tables (dev only - disable in production)
  logging: process.env.DB_LOGGING === 'true',
  entities: [Account, Market, Position, Trade, Payment, Asset],
  migrations: [],
  subscribers: [],
  // Connection pool settings
  extra: {
    max: 10, // Maximum connections in pool
    min: 2,  // Minimum connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});

/**
 * Initialize the database connection with retry logic.
 * 
 * @param maxRetries - Maximum number of connection attempts
 * @param retryDelay - Delay between retries in milliseconds
 */
export async function initializeDatabase(
  maxRetries = 5,
  retryDelay = 2000
): Promise<DataSource> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB] Attempting to connect to PostgreSQL (attempt ${attempt}/${maxRetries})...`);
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      console.log('[DB] ✓ Connected to PostgreSQL successfully');
      console.log(`[DB]   Host: ${(AppDataSource.options as any).host}`);
      console.log(`[DB]   Database: ${(AppDataSource.options as any).database}`);
      console.log(`[DB]   Port: ${(AppDataSource.options as any).port}`);
      
      return AppDataSource;
    } catch (error) {
      lastError = error as Error;
      console.error(`[DB] ✗ Connection attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
      
      if (attempt < maxRetries) {
        console.log(`[DB] Retrying in ${retryDelay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new Error(
    `Failed to connect to database after ${maxRetries} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}. ` +
    `Please check your database configuration and ensure PostgreSQL is running.`
  );
}

/**
 * Close the database connection gracefully.
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('[DB] Connection closed');
  }
}

/**
 * Check if the database connection is healthy.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    await AppDataSource.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('[DB] Health check failed:', error);
    return false;
  }
}


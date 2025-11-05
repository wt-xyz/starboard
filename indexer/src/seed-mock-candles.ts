import { DataSource } from 'typeorm';
import { CandleResolution } from './model/generated';
import { generateMockCandles } from './services/candleGenerator';

// Simple tickers for testing
const TICKERS = ['BTC', 'ETH', 'SOL', 'MIRG-USD'];
const BASE_PRICES: Record<string, number> = {
  'BTC': 50000,
  'ETH': 3000,
  'SOL': 100,
  'MIRG-USD': 1.50,
};

async function main() {
  console.log('Starting to seed mock candles...');
  
  // Create TypeORM data source
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '23751'),
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    synchronize: false,
  });
  
  await dataSource.initialize();
  
  try {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    for (const ticker of TICKERS) {
      console.log(`\nSeeding candles for ${ticker}...`);
      const basePrice = BASE_PRICES[ticker];
      
      // Generate hourly candles for the past 7 days
      const candles = generateMockCandles(
        ticker,
        CandleResolution.H1,
        sevenDaysAgo,
        168, // 7 days * 24 hours
        basePrice
      );
      
      console.log(`Generated ${candles.length} candles for ${ticker}`);
      
      // Insert using raw SQL in batches
      const batchSize = 50;
      for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize);
        const values = batch.map(candle => 
          `('${candle.id}', '${candle.ticker}', '${candle.resolution}', ${candle.startedAt}, '${candle.open}', '${candle.close}', '${candle.high}', '${candle.low}', ${candle.volume ? `'${candle.volume}'` : 'NULL'}, ${candle.trades || 'NULL'})`
        ).join(',\n');
        
        await dataSource.query(`
          INSERT INTO candle (id, ticker, resolution, started_at, open, close, high, low, volume, trades)
          VALUES ${values}
        `);
        console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(candles.length / batchSize)}`);
      }
    }
    
    console.log('\n✅ Mock candle seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding candles:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


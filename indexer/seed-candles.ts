#!/usr/bin/env ts-node
import { DataSource } from 'typeorm';
import { Candle, CandleResolution } from './src/model/generated';
import { generateMockCandles } from './src/services/candleGenerator';

// Database configuration (update with your actual DB config)
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'squid',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  entities: [Candle],
  synchronize: false,
});

// Mock assets with their base prices
const MOCK_ASSETS = [
  { ticker: 'BTC', basePrice: 50000 },
  { ticker: 'ETH', basePrice: 3000 },
  { ticker: 'SOL', basePrice: 100 },
  { ticker: 'AVAX', basePrice: 30 },
  { ticker: 'MIRG-USD', basePrice: 150 }, // The one from the user's screenshot
];

const RESOLUTIONS = [
  CandleResolution.M1,
  CandleResolution.M5,
  CandleResolution.M15,
  CandleResolution.M30,
  CandleResolution.H1,
  CandleResolution.H4,
  CandleResolution.D1,
];

async function seedCandles() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  
  console.log('Starting candle seeding...');
  const now = Date.now();
  
  for (const asset of MOCK_ASSETS) {
    console.log(`\nSeeding candles for ${asset.ticker}...`);
    
    for (const resolution of RESOLUTIONS) {
      let count: number;
      let startTime: number;
      
      // Determine count and start time based on resolution
      switch (resolution) {
        case CandleResolution.M1:
          count = 1440; // 1 day
          startTime = now - 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.M5:
          count = 2016; // 7 days
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.M15:
          count = 672; // 7 days
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.M30:
          count = 720; // 15 days
          startTime = now - 15 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.H1:
          count = 720; // 30 days
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.H4:
          count = 180; // 30 days
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.D1:
          count = 90; // 90 days
          startTime = now - 90 * 24 * 60 * 60 * 1000;
          break;
        default:
          count = 100;
          startTime = now - 30 * 24 * 60 * 60 * 1000;
      }

      const candles = generateMockCandles(
        asset.ticker,
        resolution,
        startTime,
        count,
        asset.basePrice
      );

      // Insert in batches
      const batchSize = 100;
      let inserted = 0;
      
      for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize);
        await dataSource.manager.save(Candle, batch);
        inserted += batch.length;
      }

      console.log(`  ✓ Inserted ${inserted} ${resolution} candles`);
    }
  }
  
  console.log('\n✅ Candle seeding complete!');
  await dataSource.destroy();
}

// Run the seeder
seedCandles().catch((error) => {
  console.error('Error seeding candles:', error);
  process.exit(1);
});


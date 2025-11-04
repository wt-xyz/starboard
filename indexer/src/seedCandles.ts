import { Store } from '@subsquid/typeorm-store';
import { CandleResolution, generateMockCandles } from './services/candleGenerator';

// Mock asset IDs (these should match your actual asset IDs)
const MOCK_ASSETS = [
  { id: '0x0000000000000000000000000000000000000000000000000000000000000001', basePrice: 50000 }, // BTC
  { id: '0x0000000000000000000000000000000000000000000000000000000000000002', basePrice: 3000 },  // ETH
  { id: '0x0000000000000000000000000000000000000000000000000000000000000003', basePrice: 100 },   // Generic asset
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

/**
 * Seeds the database with mock candle data
 */
export async function seedMockCandles(store: Store) {
  console.log('Starting candle seeding...');
  
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  for (const asset of MOCK_ASSETS) {
    console.log(`Seeding candles for asset: ${asset.id}`);
    
    for (const resolution of RESOLUTIONS) {
      // Generate appropriate number of candles based on resolution
      let count: number;
      let startTime: number;
      
      switch (resolution) {
        case CandleResolution.M1:
          count = 1440; // 1 day of 1-minute candles
          startTime = now - 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.M5:
          count = 2016; // 7 days of 5-minute candles
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.M15:
          count = 672; // 7 days of 15-minute candles
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.M30:
          count = 720; // 15 days of 30-minute candles
          startTime = now - 15 * 24 * 60 * 60 * 1000;
          break;
        case CandleResolution.H1:
          count = 720; // 30 days of hourly candles
          startTime = thirtyDaysAgo;
          break;
        case CandleResolution.H4:
          count = 180; // 30 days of 4-hour candles
          startTime = thirtyDaysAgo;
          break;
        case CandleResolution.D1:
          count = 90; // 90 days of daily candles
          startTime = now - 90 * 24 * 60 * 60 * 1000;
          break;
        default:
          count = 100;
          startTime = thirtyDaysAgo;
      }

      const candles = generateMockCandles(
        asset.id,
        resolution,
        startTime,
        count,
        asset.basePrice
      );

      console.log(`  Generated ${candles.length} ${resolution} candles`);
      
      // Note: The actual entity insertion would happen in the main.ts
      // This function just generates the data structure
    }
  }

  console.log('Candle seeding complete!');
}

// If run directly, provide info
if (require.main === module) {
  console.log('This is a candle generation service.');
  console.log('Import and use seedMockCandles() in your indexer main.ts');
}


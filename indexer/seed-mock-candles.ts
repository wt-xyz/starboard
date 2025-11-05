import { TypeormDatabase } from '@subsquid/typeorm-store';
import { Candle, CandleResolution } from './src/model/generated';
import { generateMockCandles } from './src/services/candleGenerator';

// Simple tickers for testing
const TICKERS = ['BTC', 'ETH', 'SOL'];
const BASE_PRICES: Record<string, number> = {
  'BTC': 50000,
  'ETH': 3000,
  'SOL': 100,
};

async function main() {
  console.log('Starting to seed mock candles...');
  
  const db = new TypeormDatabase();
  await db.connect();
  
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
      
      // Save in batches
      const batchSize = 50;
      for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize);
        await db.store.save(Candle, batch);
        console.log(`  Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(candles.length / batchSize)}`);
      }
    }
    
    console.log('\n✅ Mock candle seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding candles:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


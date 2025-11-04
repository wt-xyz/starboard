import type { EntityManager } from 'typeorm';
import { Candle, CandleResolution } from '../../model/generated';
import { generateMockCandles } from '../../services/candleGenerator';

export interface GetCandlesParams {
  ticker: string;
  resolution: CandleResolution;
  fromMs: number;
  toMs: number;
}

/**
 * Custom resolver to fetch candles
 */
export async function getCandles(
  manager: EntityManager,
  params: GetCandlesParams
): Promise<Candle[]> {
  const { ticker, resolution, fromMs, toMs } = params;

  const candles = await manager
    .getRepository(Candle)
    .createQueryBuilder('candle')
    .where('candle.ticker = :ticker', { ticker })
    .andWhere('candle.resolution = :resolution', { resolution })
    .andWhere('candle.startedAt >= :fromMs', { fromMs: BigInt(fromMs) })
    .andWhere('candle.startedAt <= :toMs', { toMs: BigInt(toMs) })
    .orderBy('candle.startedAt', 'ASC')
    .getMany();

  // If no candles found, generate mock data
  if (candles.length === 0) {
    console.log(`No candles found for ${ticker}:${resolution}, generating mock data...`);
    return generateMockCandles(
      ticker,
      resolution,
      fromMs,
      Math.min(100, Math.ceil((toMs - fromMs) / getResolutionMs(resolution))),
      getBasePrice(ticker)
    );
  }

  return candles;
}

/**
 * Seeds mock candles for a specific asset and resolution
 */
export async function seedCandlesForAsset(
  manager: EntityManager,
  ticker: string,
  resolution: CandleResolution,
  startTime: number,
  count: number,
  basePrice: number
): Promise<number> {
  const candles = generateMockCandles(ticker, resolution, startTime, count, basePrice);
  
  // Insert in batches to avoid overwhelming the database
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < candles.length; i += batchSize) {
    const batch = candles.slice(i, i + batchSize);
    await manager.save(Candle, batch);
    inserted += batch.length;
  }

  return inserted;
}

// Helper functions
function getResolutionMs(resolution: CandleResolution): number {
  const map: Record<CandleResolution, number> = {
    [CandleResolution.M1]: 60 * 1000,
    [CandleResolution.M5]: 5 * 60 * 1000,
    [CandleResolution.M15]: 15 * 60 * 1000,
    [CandleResolution.M30]: 30 * 60 * 1000,
    [CandleResolution.H1]: 60 * 60 * 1000,
    [CandleResolution.H4]: 4 * 60 * 60 * 1000,
    [CandleResolution.D1]: 24 * 60 * 60 * 1000,
  };
  return map[resolution];
}

function getBasePrice(ticker: string): number {
  // Return different base prices for different assets
  const basePrices: Record<string, number> = {
    'BTC': 50000,
    'ETH': 3000,
    'SOL': 100,
    'AVAX': 30,
  };
  return basePrices[ticker] || 100;
}


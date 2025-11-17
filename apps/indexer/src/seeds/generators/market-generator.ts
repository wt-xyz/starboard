import { BigDecimal } from '@subsquid/big-decimal';
import { Market } from '../../model/generated/market.model';
import { MarketType } from '../../model/generated/_marketType';
import { MarketStatus } from '../../model/generated/_marketStatus';

export type MarketSpec = {
  ticker: string;
  clobPairId: number;
  basePrice: number;
  priceVariance: number;
  baseVolume: number;
  minLeverage: number;
  maxLeverage: number;
  makerFee: string;
  takerFee: string;
};

export const MARKET_SPECS: MarketSpec[] = [
  { 
    ticker: 'ETH-USD', 
    clobPairId: 1, 
    basePrice: 3200.42, 
    priceVariance: 120.33, 
    baseVolume: 250_000_000_000,
    minLeverage: 2,
    maxLeverage: 20,
    makerFee: '0.0002',
    takerFee: '0.0005',
  },
  { 
    ticker: 'BTC-USD', 
    clobPairId: 2, 
    basePrice: 62050.12, 
    priceVariance: 980.45, 
    baseVolume: 480_000_000_000,
    minLeverage: 2,
    maxLeverage: 20,
    makerFee: '0.0002',
    takerFee: '0.0005',
  },
  { 
    ticker: 'SOL-USD', 
    clobPairId: 3, 
    basePrice: 185.37, 
    priceVariance: 18.55, 
    baseVolume: 125_000_000_000,
    minLeverage: 2,
    maxLeverage: 10,
    makerFee: '0.0002',
    takerFee: '0.0005',
  },
  { 
    ticker: 'FUEL-USD', 
    clobPairId: 4, 
    basePrice: 0.089, 
    priceVariance: 0.012, 
    baseVolume: 45_000_000_000,
    minLeverage: 2,
    maxLeverage: 10,
    makerFee: '0.0002',
    takerFee: '0.0005',
  },
];

/**
 * Generate market entities for database seeding.
 * 
 * @param specs - Market specifications (defaults to MARKET_SPECS)
 * @returns Array of Market entities ready to be inserted
 */
export function generateMarkets(specs: MarketSpec[] = MARKET_SPECS): Market[] {
  return specs.map((spec, idx) => {
    const market = new Market({
      id: spec.ticker,
      ticker: spec.ticker,
      clobPairId: spec.clobPairId,
      atomicResolution: -9, // 9 decimals for most assets
      baseOpenInterest: '0',
      defaultFundingRate1H: BigDecimal('0.00001'),
      initialMarginFraction: BigDecimal('0.05'), // 5% initial margin (20x leverage)
      maintenanceMarginFraction: BigDecimal('0.03'), // 3% maintenance margin
      marketType: MarketType.PERP,
      nextFundingRate: BigDecimal('0.000012'),
      openInterest: BigDecimal(String(spec.baseVolume * 0.3)),
      openInterestLowerCap: null,
      openInterestUpperCap: null,
      oraclePrice: BigDecimal(String(spec.basePrice)),
      priceChange24H: BigDecimal(String((Math.random() - 0.5) * 10)),
      quantumConversionExponent: -6,
      status: MarketStatus.Active,
      stepBaseQuantums: BigInt(1000000000),
      stepSize: BigDecimal('0.001'),
      subticksPerTick: 100000,
      tickSize: BigDecimal('0.01'),
      trades24H: BigDecimal(String(Math.floor(1000 + Math.random() * 5000))),
      volume24H: BigDecimal(String(spec.baseVolume)),
    });

    return market;
  });
}

/**
 * Get the base price for a specific market ticker.
 * Useful for generating related entities like positions and trades.
 */
export function getMarketBasePrice(ticker: string): number {
  const spec = MARKET_SPECS.find(s => s.ticker === ticker);
  return spec?.basePrice || 1000;
}

/**
 * Get all market tickers.
 */
export function getAllMarketTickers(): string[] {
  return MARKET_SPECS.map(s => s.ticker);
}





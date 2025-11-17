import { BigDecimal } from '@subsquid/big-decimal';
import { Trade } from '../../model/generated/trade.model';
import { OrderSide } from '../../model/generated/_orderSide';
import { TradeType } from '../../model/generated/_tradeType';
import { Market } from '../../model/generated/market.model';
import { Position } from '../../model/generated/position.model';
import { getMarketBasePrice } from './market-generator';
import { seededRandomFloat } from '../utils/random';

export type TradeSpec = {
  ticker: string;
  side: 'BUY' | 'SELL';
  size: number;
  positionId?: string;
  tradeType?: 'Limit' | 'Liquidation';
};

/**
 * Generate trade entities for database seeding.
 * 
 * @param specs - Trade specifications
 * @param markets - Market entities map (for relations)
 * @param positions - Position entities map (for relations, optional)
 * @returns Array of Trade entities ready to be inserted
 */
export function generateTrades(
  specs: TradeSpec[],
  markets: Map<string, Market>,
  positions?: Map<string, Position>
): Trade[] {
  return specs.map((spec, idx) => {
    const market = markets.get(spec.ticker);
    
    if (!market) {
      throw new Error(`Invalid market for trade: ${spec.ticker}`);
    }

    const basePrice = getMarketBasePrice(spec.ticker);
    const seed = `${spec.ticker}-${idx}`;
    const price = seededRandomFloat(seed, basePrice * 0.98, basePrice * 1.02);
    
    const createdAt = new Date(Date.now() - (100 - idx) * 60 * 1000); // Last 100 minutes
    
    const position = spec.positionId && positions ? positions.get(spec.positionId) : null;

    const trade = new Trade({
      id: `trade-${spec.ticker}-${createdAt.getTime()}-${idx}`,
      createdAtHeight: 12400000 + idx,
      createdAt,
      side: spec.side as OrderSide,
      price: BigDecimal(String(price)),
      size: BigDecimal(String(spec.size)),
      tradeType: (spec.tradeType || 'Limit') as TradeType,
      market,
      position: position || null,
    });

    return trade;
  });
}

/**
 * Generate default trade specs for a given market.
 * Creates realistic trade distribution over time.
 */
export function generateDefaultTradeSpecs(ticker: string, count: number = 100): TradeSpec[] {
  const specs: TradeSpec[] = [];
  
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 'BUY' : 'SELL';
    const size = 1 + (i % 10);
    const tradeType = i % 20 === 0 ? 'Liquidation' : 'Limit';
    
    specs.push({
      ticker,
      side,
      size,
      tradeType,
    });
  }
  
  return specs;
}


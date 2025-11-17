import { BigDecimal } from '@subsquid/big-decimal';
import { Position } from '../../model/generated/position.model';
import { PositionStatus } from '../../model/generated/_positionStatus';
import { PositionSide } from '../../model/generated/_positionSide';
import { Account } from '../../model/generated/account.model';
import { Market } from '../../model/generated/market.model';
import { getMarketBasePrice } from './market-generator';
import { seededRandom } from '../utils/random';

export type PositionSpec = {
  accountAddress: string;
  ticker: string;
  side: 'LONG' | 'SHORT';
  size: number; // in base units
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
};

/**
 * Generate position entities for database seeding.
 * 
 * @param specs - Position specifications
 * @param accounts - Account entities map (for relations)
 * @param markets - Market entities map (for relations)
 * @returns Array of Position entities ready to be inserted
 */
export function generatePositions(
  specs: PositionSpec[],
  accounts: Map<string, Account>,
  markets: Map<string, Market>
): Position[] {
  return specs.map((spec, idx) => {
    const account = accounts.get(`${spec.accountAddress}-0`);
    const market = markets.get(spec.ticker);
    
    if (!account || !market) {
      throw new Error(`Invalid account or market for position: ${spec.accountAddress}, ${spec.ticker}`);
    }

    const basePrice = getMarketBasePrice(spec.ticker);
    const seed = `${spec.accountAddress}-${spec.ticker}-${idx}`;
    const rand = seededRandom(seed);
    
    // Entry price with small variance
    const entryPrice = basePrice * (1 + (rand() - 0.5) * 0.02);
    const exitPrice = spec.status === 'CLOSED' ? basePrice * (1 + (rand() - 0.5) * 0.05) : null;
    
    // Calculate P&L
    const priceChange = exitPrice ? (exitPrice - entryPrice) : (basePrice - entryPrice);
    const pnlMultiplier = spec.side === 'LONG' ? 1 : -1;
    const unrealizedPnl = spec.status === 'OPEN' ? priceChange * spec.size * pnlMultiplier : 0;
    const realizedPnl = spec.status === 'CLOSED' ? priceChange * spec.size * pnlMultiplier : 0;

    const createdAt = new Date(Date.now() - (30 - idx) * 24 * 60 * 60 * 1000); // Last 30 days
    const closedAt = spec.status === 'CLOSED' ? new Date(Date.now() - (5 - idx % 5) * 24 * 60 * 60 * 1000) : null;

    const position = new Position({
      id: `${account.id}-${market.id}-${createdAt.getTime()}`,
      status: spec.status as PositionStatus,
      side: spec.side as PositionSide,
      size: BigInt(Math.floor(spec.size * 1e9)), // Convert to atomic units
      maxSize: BigInt(Math.floor(spec.size * 1.2 * 1e9)),
      entryPrice: BigDecimal(String(entryPrice)),
      exitPrice: exitPrice ? BigDecimal(String(exitPrice)) : null,
      realizedPnl: BigDecimal(String(realizedPnl)),
      createdAt,
      createdAtHeight: 12400000 + idx,
      sumOpen: BigDecimal(String(spec.size * entryPrice)),
      sumClose: exitPrice ? BigDecimal(String(spec.size * exitPrice)) : BigDecimal('0'),
      netFunding: BigDecimal(String((rand() - 0.5) * 100)),
      unrealizedPnl: BigDecimal(String(unrealizedPnl)),
      closedAt,
      subaccountNumber: 0,
      ticker: spec.ticker,
      collateral: BigDecimal(String(spec.size * basePrice * 0.1)), // 10% collateral
      positionFees: BigDecimal(String(spec.size * basePrice * 0.0005)), // 0.05% fees
      entryFundingRate: BigDecimal('0.00001'),
      reserveAmount: BigDecimal('0'),
      lastIncreasedTime: createdAt,
      account,
      market,
    });

    return position;
  });
}

/**
 * Generate default position specs for testing.
 * Creates a mix of open/closed positions across different markets.
 */
export function generateDefaultPositionSpecs(accountAddresses: string[], tickers: string[]): PositionSpec[] {
  const specs: PositionSpec[] = [];
  
  accountAddresses.forEach((address, accountIdx) => {
    tickers.forEach((ticker, tickerIdx) => {
      // Each account has 1-2 positions per market
      const numPositions = accountIdx % 2 === 0 ? 1 : 2;
      
      for (let i = 0; i < numPositions; i++) {
        const side = (accountIdx + tickerIdx + i) % 2 === 0 ? 'LONG' : 'SHORT';
        const status = i === 0 ? 'OPEN' : 'CLOSED';
        const size = (10 + (accountIdx + tickerIdx) * 5) * (1 + i);
        
        specs.push({
          accountAddress: address,
          ticker,
          side,
          status,
          size,
        });
      }
    });
  });
  
  return specs;
}





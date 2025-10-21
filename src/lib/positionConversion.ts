import { MarginMode, PositionUniqueId, SubaccountPosition } from '@/bonsai/types/summaryTypes';
import { IndexerPositionSide } from '@/types/indexer/indexerApiGen';
import { BigNumber } from 'bignumber.js';
import { Position, PositionSide as SDKPositionSide } from 'starboard-client-js';

/**
 * Converts SDK Position to SubaccountPosition format
 */
export function convertSDKPositionToSubaccountPosition(
  sdkPosition: Position,
  address: string,
  subaccountNumber: number
): SubaccountPosition {
  const positionKey = `${address}:${subaccountNumber}:${sdkPosition.market}`;
  
  // Convert position side
  const side = sdkPosition.side === SDKPositionSide.LONG 
    ? IndexerPositionSide.LONG 
    : IndexerPositionSide.SHORT;

  // Calculate derived values
  const signedSize = new BigNumber(sdkPosition.size);
  const unsignedSize = signedSize.abs();
  const entryPrice = new BigNumber(sdkPosition.entryPrice);
  const notional = unsignedSize.multipliedBy(entryPrice);
  const value = signedSize.multipliedBy(entryPrice);
  
  // Calculate leverage (simplified - in real app this would come from margin data)
  const leverage = new BigNumber(20); // Default leverage for mock data
  
  // Calculate margin values (simplified calculations)
  const marginValueInitial = notional.dividedBy(leverage);
  const marginValueMaintenance = marginValueInitial.multipliedBy(0.6);
  
  // Calculate unrealized PnL percentage
  const unrealizedPnl = new BigNumber(sdkPosition.unrealizedPnl || '0');
  const unrealizedPnlPercent = notional.isZero() 
    ? new BigNumber(0) 
    : unrealizedPnl.dividedBy(notional).multipliedBy(100);

  // Calculate liquidation price (simplified)
  const liquidationPrice = entryPrice.multipliedBy(
    sdkPosition.side === SDKPositionSide.LONG ? 0.95 : 1.05
  );

  return {
    // Base fields from SDK position
    subaccountNumber,
    market: sdkPosition.market,
    side,
    status: 'OPEN' as any, // Default status for mock data
    maxSize: new BigNumber(sdkPosition.maxSize),
    entryPrice,
    realizedPnl: new BigNumber(sdkPosition.realizedPnl),
    createdAt: sdkPosition.createdAt,
    createdAtHeight: new BigNumber(sdkPosition.createdAtHeight),
    sumOpen: new BigNumber(sdkPosition.sumOpen || '0'),
    sumClose: new BigNumber(sdkPosition.sumClose || '0'),
    netFunding: new BigNumber(sdkPosition.netFunding || '0'),
    unrealizedPnl: new BigNumber(sdkPosition.unrealizedPnl || '0'),
    exitPrice: sdkPosition.exitPrice ? new BigNumber(sdkPosition.exitPrice) : undefined,

    // Derived fields
    uniqueId: positionKey as PositionUniqueId,
    assetId: sdkPosition.market.split('-')[0] || sdkPosition.market, // Extract asset from market (e.g., 'BTC-USD' -> 'BTC')
    marginMode: 'ISOLATED' as MarginMode, // Default to isolated for mock data
    signedSize,
    unsignedSize,
    notional,
    value,
    adjustedImf: new BigNumber(0.05), // 5% initial margin fraction
    adjustedMmf: new BigNumber(0.03), // 3% maintenance margin fraction
    initialRisk: marginValueInitial,
    maintenanceRisk: marginValueMaintenance,
    maxLeverage: leverage,
    baseEntryPrice: entryPrice,
    baseNetFunding: new BigNumber(sdkPosition.netFunding || '0'),
    leverage,
    marginValueInitial,
    marginValueMaintenance,
    updatedUnrealizedPnl: unrealizedPnl,
    updatedUnrealizedPnlPercent: unrealizedPnlPercent,
    liquidationPrice,
  };
}

/**
 * Converts multiple SDK positions to SubaccountPosition array
 */
export function convertSDKPositionsToSubaccountPositions(
  sdkPositions: Position[],
  address: string,
  subaccountNumber: number
): SubaccountPosition[] {
  return sdkPositions.map(position => 
    convertSDKPositionToSubaccountPosition(position, address, subaccountNumber)
  );
}

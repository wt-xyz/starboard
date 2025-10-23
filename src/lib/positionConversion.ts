import { MarginMode, PositionUniqueId, SubaccountPosition } from '@/bonsai/types/summaryTypes';
import { IndexerPositionSide } from '@/types/indexer/indexerApiGen';
import { BigNumber } from 'bignumber.js';
import { Position } from '../../ts-sdk/src/types/indexer';

/**
 * Converts SDK Position (indexer format) to SubaccountPosition format
 */
export function convertSDKPositionToSubaccountPosition(
  sdkPosition: Position,
  address: string,
  subaccountNumber: number
): SubaccountPosition {
  // Use the position key from the indexer Position
  const market = `${sdkPosition.positionKey.indexAssetId}-USD`; // Construct market name
  const positionKey = `${address}:${subaccountNumber}:${market}`;
  
  // Convert position side
  const side = sdkPosition.positionKey.isLong 
    ? IndexerPositionSide.LONG 
    : IndexerPositionSide.SHORT;

  // Calculate derived values
  // Size and collateral are in base units (need to divide by 1e9 for display)
  const sizeInUnits = new BigNumber(sdkPosition.size).dividedBy(1e9);
  const collateralInUnits = new BigNumber(sdkPosition.collateralAmout).dividedBy(1e9);
  
  const signedSize = sizeInUnits.multipliedBy(sdkPosition.positionKey.isLong ? 1 : -1);
  const unsignedSize = sizeInUnits.abs();
  
  // Estimate entry price from size and collateral (simplified)
  const leverage = unsignedSize.isZero() ? new BigNumber(1) : sizeInUnits.dividedBy(collateralInUnits);
  const estimatedEntryPrice = new BigNumber(50000); // Default price for mock data
  const notional = unsignedSize.multipliedBy(estimatedEntryPrice);
  const value = signedSize.multipliedBy(estimatedEntryPrice);
  
  // Calculate margin values (simplified calculations)
  const marginValueInitial = collateralInUnits;
  const marginValueMaintenance = marginValueInitial.multipliedBy(0.6);
  
  // Calculate unrealized PnL (simplified - would need current price in real app)
  const unrealizedPnl = new BigNumber(0);
  const unrealizedPnlPercent = new BigNumber(0);

  // Calculate liquidation price (simplified)
  const liquidationPrice = estimatedEntryPrice.multipliedBy(
    sdkPosition.positionKey.isLong ? 0.95 : 1.05
  );

  const createdAt = new Date(sdkPosition.timestamp).toISOString();

  return {
    // Base fields from SDK position
    subaccountNumber,
    market,
    side,
    status: 'OPEN' as any, // Default status for mock data
    maxSize: unsignedSize,
    entryPrice: estimatedEntryPrice,
    realizedPnl: new BigNumber(0),
    createdAt,
    createdAtHeight: new BigNumber(0),
    sumOpen: sizeInUnits,
    sumClose: new BigNumber(0),
    netFunding: new BigNumber(0),
    unrealizedPnl,
    exitPrice: undefined,

    // Derived fields
    uniqueId: positionKey as PositionUniqueId,
    assetId: sdkPosition.positionKey.indexAssetId,
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
    baseEntryPrice: estimatedEntryPrice,
    baseNetFunding: new BigNumber(0),
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

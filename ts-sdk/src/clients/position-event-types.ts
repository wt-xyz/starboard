export enum PositionEventType {
  POSITION_OPENED = 'POSITION_OPENED',
  POSITION_MODIFIED = 'POSITION_MODIFIED',
  POSITION_CLOSED = 'POSITION_CLOSED',
  POSITION_LIQUIDATED = 'POSITION_LIQUIDATED',
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

import { PositionStatus } from './constants';
export { PositionStatus };

export interface Position {
  market: string;
  status: PositionStatus;
  side: PositionSide;
  size: string;
  maxSize: string;
  entryPrice: string;
  exitPrice?: string;
  realizedPnl: string;
  unrealizedPnl?: string;
  createdAt: string;
  createdAtHeight: string;
  closedAt?: string;
  subaccountNumber?: number;
  sumOpen?: string;
  sumClose?: string;
  netFunding?: string;
}

export interface PositionUpdate extends Partial<Position> {
  market: string;
  subaccountNumber?: number;
}

export interface PositionEvent {
  type: PositionEventType;
  position: Position;
  previousPosition?: Position;
  timestamp: number;
  blockHeight?: string;
  subaccount: {
    address: string;
    subaccountNumber: number;
  };
}

export interface PositionAnalytics {
  positionId: string;
  market: string;
  side: PositionSide;
  entryPrice: number;
  exitPrice?: number;
  sizeUsd: number;
  leverage?: number;
  liquidationPrice?: number;
  durationSeconds?: number;
  realizedPnl: number;
  realizedPnlPercent?: number;
  fees?: number;
  eventType: PositionEventType;
  timestamp: number;
  address: string;
  subaccountNumber: number;
}

export interface PositionLimits {
  minSizeUsd: number;
  maxSizeUsd: number;
  minLeverage: number;
  maxLeverage: number;
  supportedAssets: string[];
}

export const DEFAULT_POSITION_LIMITS: Record<string, PositionLimits> = {
  'BTC-USD': {
    minSizeUsd: 10,
    maxSizeUsd: 1000000,
    minLeverage: 2,
    maxLeverage: 20,
    supportedAssets: ['BTC'],
  },
  'ETH-USD': {
    minSizeUsd: 10,
    maxSizeUsd: 1000000,
    minLeverage: 2,
    maxLeverage: 20,
    supportedAssets: ['ETH'],
  },
  'FUEL-USD': {
    minSizeUsd: 10,
    maxSizeUsd: 1000000,
    minLeverage: 2,
    maxLeverage: 10,
    supportedAssets: ['FUEL'],
  },
  'stFUEL-USD': {
    minSizeUsd: 10,
    maxSizeUsd: 1000000,
    minLeverage: 2,
    maxLeverage: 10,
    supportedAssets: ['stFUEL'],
  },
};

export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: PositionSide,
  feesPercent: number = 0.001
): number {
  if (side === PositionSide.LONG) {
    return entryPrice * (1 - 1 / leverage - feesPercent);
  } else {
    return entryPrice * (1 + 1 / leverage + feesPercent);
  }
}

export function calculateLeverage(sizeUsd: number, collateralUsd: number): number {
  if (collateralUsd <= 0) return 0;
  return sizeUsd / collateralUsd;
}

export function validatePositionParams(
  market: string,
  sizeUsd: number,
  leverage: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const limits = DEFAULT_POSITION_LIMITS[market];

  if (!limits) {
    errors.push(`Unsupported market: ${market}`);
    return { valid: false, errors };
  }

  if (sizeUsd < limits.minSizeUsd) {
    errors.push(`Position size ${sizeUsd} USD is below minimum ${limits.minSizeUsd} USD`);
  }

  if (sizeUsd > limits.maxSizeUsd) {
    errors.push(`Position size ${sizeUsd} USD exceeds maximum ${limits.maxSizeUsd} USD`);
  }

  if (leverage < limits.minLeverage) {
    errors.push(`Leverage ${leverage}x is below minimum ${limits.minLeverage}x`);
  }

  if (leverage > limits.maxLeverage) {
    errors.push(`Leverage ${leverage}x exceeds maximum ${limits.maxLeverage}x`);
  }

  return { valid: errors.length === 0, errors };
}

export function calculateRealizedPnlPercent(
  realizedPnl: number,
  entryPrice: number,
  size: number
): number {
  const positionValue = entryPrice * size;
  if (positionValue === 0) return 0;
  return (realizedPnl / positionValue) * 100;
}


import { PositionSide, PositionStatus, PositionUpdate } from 'starboard-client-js';

// Mock position updates that will be processed by the PositionEventProcessor
export const mockPositionUpdates: PositionUpdate[] = [
  {
    market: 'BTC-USD',
    subaccountNumber: 0,
    status: PositionStatus.OPEN,
    side: PositionSide.LONG,
    size: '0.5',
    maxSize: '1.0',
    entryPrice: '44000',
    realizedPnl: '500',
    unrealizedPnl: '600',
    createdAt: '2024-01-15T10:30:00Z',
    createdAtHeight: '12345678',
    sumOpen: '22000',
    sumClose: '0',
    netFunding: '-25.5',
  },
  {
    market: 'ETH-USD',
    subaccountNumber: 0,
    status: PositionStatus.OPEN,
    side: PositionSide.SHORT,
    size: '2.0',
    maxSize: '5.0',
    entryPrice: '3250',
    realizedPnl: '-100',
    unrealizedPnl: '-140',
    createdAt: '2024-01-15T11:15:00Z',
    createdAtHeight: '12345679',
    sumOpen: '6500',
    sumClose: '0',
    netFunding: '15.2',
  },
  {
    market: 'SOL-USD',
    subaccountNumber: 0,
    status: PositionStatus.OPEN,
    side: PositionSide.LONG,
    size: '50',
    maxSize: '100',
    entryPrice: '175',
    realizedPnl: '0',
    unrealizedPnl: '650',
    createdAt: '2024-01-15T12:00:00Z',
    createdAtHeight: '12345680',
    sumOpen: '8750',
    sumClose: '0',
    netFunding: '-5.5',
  },
];

// Mock address and subaccount for testing
export const MOCK_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
export const MOCK_SUBACCOUNT_NUMBER = 0;

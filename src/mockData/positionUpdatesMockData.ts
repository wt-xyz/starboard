import { PositionUpdate } from '../../ts-sdk/src/clients/position-event-processor';
import { PositionChange } from '../../ts-sdk/src/types/indexer';

// Mock address and subaccount for testing
export const MOCK_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
export const MOCK_SUBACCOUNT_NUMBER = 0;

// Mock position updates that will be processed by the PositionEventProcessor
export const mockPositionUpdates: PositionUpdate[] = [
  {
    account: MOCK_ADDRESS,
    indexAssetId: 'BTC',
    isLong: true,
    size: '22000000000', // $22,000 in base units (0.5 BTC at $44,000)
    collateralAmout: '2200000000', // $2,200 collateral (10x leverage)
    change: PositionChange.INCREASE,
    timestamp: new Date('2024-01-15T10:30:00Z').getTime(),
  },
  {
    account: MOCK_ADDRESS,
    indexAssetId: 'ETH',
    isLong: false,
    size: '6500000000', // $6,500 in base units (2 ETH at $3,250)
    collateralAmout: '650000000', // $650 collateral (10x leverage)
    change: PositionChange.INCREASE,
    timestamp: new Date('2024-01-15T11:15:00Z').getTime(),
  },
  {
    account: MOCK_ADDRESS,
    indexAssetId: 'SOL',
    isLong: true,
    size: '8750000000', // $8,750 in base units (50 SOL at $175)
    collateralAmout: '875000000', // $875 collateral (10x leverage)
    change: PositionChange.INCREASE,
    timestamp: new Date('2024-01-15T12:00:00Z').getTime(),
  },
];

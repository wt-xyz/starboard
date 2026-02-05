import type { StoreService } from '@sdk/shared/lib/StoreService';
import type { RootState } from '@sdk/shared/lib/redux';
import { CollateralAmount } from '@sdk/shared/models/decimals';
import { positionStableId } from '@sdk/shared/types';
import { describe, expect, it, vi } from 'vitest';
import { createGetPositionLeverageQuery } from '../../src/Positions/application/queries/getPositionLeverage';
import { PositionSize } from '../../src/Positions/domain/positionsDecimals';
import { createMinimalPosition } from './helpers/createMinimalPosition';

function createMockStoreService(
  positions: ReturnType<typeof createMinimalPosition>[]
): StoreService {
  const state = {
    trading: {
      positions: {
        positions: {
          ids: positions.map((p) => p.revisionId),
          entities: Object.fromEntries(positions.map((p) => [p.revisionId, p])),
        },
      },
    },
  } as unknown as RootState;

  return {
    dispatch: vi.fn(),
    select: vi.fn((selector) => selector(state)),
    getState: vi.fn(() => state),
  };
}

describe('getPositionLeverage query', () => {
  const testStableId = positionStableId('test-stable-1');

  it('returns zero for non-existent position', () => {
    const storeService = createMockStoreService([]);
    const getPositionLeverage = createGetPositionLeverageQuery({ storeService });

    const result = getPositionLeverage(positionStableId('non-existent'));

    expect(result.value).toBe('0');
  });

  it('calculates leverage for existing position', () => {
    const position = createMinimalPosition({
      stableId: testStableId,
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
      isLatest: true,
    });
    const storeService = createMockStoreService([position]);
    const getPositionLeverage = createGetPositionLeverageQuery({ storeService });

    const result = getPositionLeverage(testStableId);

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(10, 5);
  });

  it('returns zero for position with zero collateral', () => {
    const position = createMinimalPosition({
      stableId: testStableId,
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(0),
      isLatest: true,
    });
    const storeService = createMockStoreService([position]);
    const getPositionLeverage = createGetPositionLeverageQuery({ storeService });

    const result = getPositionLeverage(testStableId);

    expect(result.value).toBe('0');
  });

  it('only considers latest position', () => {
    const oldPosition = createMinimalPosition({
      stableId: testStableId,
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
      isLatest: false,
    });
    const storeService = createMockStoreService([oldPosition]);
    const getPositionLeverage = createGetPositionLeverageQuery({ storeService });

    const result = getPositionLeverage(testStableId);

    expect(result.value).toBe('0');
  });
});

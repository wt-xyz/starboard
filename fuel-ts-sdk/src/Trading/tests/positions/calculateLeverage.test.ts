import { CollateralAmount } from '@sdk/shared/models/decimals';
import { describe, expect, it } from 'vitest';
import { calculateLeverage } from '../../src/Positions/domain/calculations/calculateLeverage';
import { PositionSize } from '../../src/Positions/domain/positionsDecimals';
import { createMinimalPosition } from './helpers/createMinimalPosition';

describe('calculateLeverage', () => {
  it('returns zero when collateral is zero', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(0),
    });

    const result = calculateLeverage(position);

    expect(result.value).toBe('0');
  });

  it('returns zero when size is zero', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(0),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverage(position);

    expect(result.value).toBe('0');
  });

  it('calculates 10x leverage correctly', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverage(position);

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(10, 5);
  });

  it('calculates 5x leverage correctly', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(5000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverage(position);

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(5, 5);
  });

  it('calculates 1x leverage correctly', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(1000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverage(position);

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(1, 5);
  });

  it('handles fractional leverage', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(2500),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverage(position);

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(2.5, 5);
  });
});

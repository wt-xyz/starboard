import { CollateralAmount } from '@sdk/shared/models/decimals';
import { describe, expect, it } from 'vitest';
import { calculateLeverageForCollateral } from '../../src/Positions/domain/calculations/calculateLeverageForCollateral';
import { PositionSize } from '../../src/Positions/domain/positionsDecimals';
import { createMinimalPosition } from './helpers/createMinimalPosition';

describe('calculateLeverageForCollateral', () => {
  it('returns zero when hypothetical collateral is zero', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverageForCollateral(position, CollateralAmount.fromFloat(0));

    expect(result.value).toBe('0');
  });

  it('returns zero when position size is zero', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(0),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverageForCollateral(position, CollateralAmount.fromFloat(1000));

    expect(result.value).toBe('0');
  });

  it('returns zero when hypothetical collateral is negative', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const negativeCollateral = { ...CollateralAmount.fromFloat(100), value: '-100000000' };

    const result = calculateLeverageForCollateral(position, negativeCollateral as CollateralAmount);

    expect(result.value).toBe('0');
  });

  it('calculates leverage for increased collateral', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverageForCollateral(position, CollateralAmount.fromFloat(2000));

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(5, 5);
  });

  it('calculates leverage for decreased collateral', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(1000),
    });

    const result = calculateLeverageForCollateral(position, CollateralAmount.fromFloat(500));

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(20, 5);
  });

  it('uses hypothetical collateral not position collateral', () => {
    const position = createMinimalPosition({
      size: PositionSize.fromFloat(10000),
      collateral: CollateralAmount.fromFloat(5000),
    });

    const result = calculateLeverageForCollateral(position, CollateralAmount.fromFloat(1000));

    expect(Number(result.value) / 10 ** result.decimals).toBeCloseTo(10, 5);
  });
});

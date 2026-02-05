import { $decimalValue, createDecimalValueSchema } from '@sdk/shared/models/DecimalValue';
import { CollateralAmount, OraclePrice } from '@sdk/shared/models/decimals';
import { describe, expect, it } from 'vitest';
import { PositionSide } from '../../src/Positions/domain/PositionsEntity';
import { calculateLiquidationPriceForCollateral } from '../../src/Positions/domain/calculations/calculateLiquidationPriceForCollateral';
import { PositionSize } from '../../src/Positions/domain/positionsDecimals';
import { createMinimalPosition } from './helpers/createMinimalPosition';

const MaxLeverage = createDecimalValueSchema(4);
const maxLeverage = MaxLeverage.fromFloat(50);

describe('calculateLiquidationPriceForCollateral', () => {
  describe('long positions', () => {
    it('calculates liquidation price below entry for hypothetical collateral', () => {
      const position = createMinimalPosition({
        side: PositionSide.LONG,
        size: PositionSize.fromFloat(10000),
        collateral: CollateralAmount.fromFloat(500),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(1000),
        maxLeverage
      );

      expect($decimalValue(liqPrice).toFloat()).toBeLessThan(50000);
      expect($decimalValue(liqPrice).toFloat()).toBeGreaterThan(0);
    });

    it('returns entry price when hypothetical collateral at max leverage', () => {
      const position = createMinimalPosition({
        side: PositionSide.LONG,
        size: PositionSize.fromFloat(50000),
        collateral: CollateralAmount.fromFloat(5000),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(1000),
        maxLeverage
      );

      expect($decimalValue(liqPrice).toFloat()).toBeCloseTo(50000, 0);
    });

    it('has lower liquidation price with more hypothetical collateral', () => {
      const position = createMinimalPosition({
        side: PositionSide.LONG,
        size: PositionSize.fromFloat(10000),
        collateral: CollateralAmount.fromFloat(1000),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPriceLow = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(500),
        maxLeverage
      );
      const liqPriceHigh = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(2000),
        maxLeverage
      );

      expect($decimalValue(liqPriceLow).toFloat()).toBeGreaterThan(
        $decimalValue(liqPriceHigh).toFloat()
      );
    });
  });

  describe('short positions', () => {
    it('calculates liquidation price above entry for hypothetical collateral', () => {
      const position = createMinimalPosition({
        side: PositionSide.SHORT,
        size: PositionSize.fromFloat(10000),
        collateral: CollateralAmount.fromFloat(500),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(1000),
        maxLeverage
      );

      expect($decimalValue(liqPrice).toFloat()).toBeGreaterThan(50000);
    });

    it('has higher liquidation price with less hypothetical collateral', () => {
      const position = createMinimalPosition({
        side: PositionSide.SHORT,
        size: PositionSize.fromFloat(10000),
        collateral: CollateralAmount.fromFloat(1000),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPriceLow = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(500),
        maxLeverage
      );
      const liqPriceHigh = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(2000),
        maxLeverage
      );

      expect($decimalValue(liqPriceLow).toFloat()).toBeLessThan(
        $decimalValue(liqPriceHigh).toFloat()
      );
    });
  });

  describe('edge cases', () => {
    it('returns zero when position size is zero', () => {
      const position = createMinimalPosition({
        size: PositionSize.fromFloat(0),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(1000),
        maxLeverage
      );

      expect(liqPrice.value).toBe('0');
    });

    it('returns zero when entry price is zero', () => {
      const position = createMinimalPosition({
        size: PositionSize.fromFloat(10000),
        entryPrice: OraclePrice.fromFloat(0),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(1000),
        maxLeverage
      );

      expect(liqPrice.value).toBe('0');
    });

    it('returns zero when max leverage is zero', () => {
      const position = createMinimalPosition({
        size: PositionSize.fromFloat(10000),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(1000),
        MaxLeverage.fromFloat(0)
      );

      expect(liqPrice.value).toBe('0');
    });

    it('returns entry price when hypothetical collateral is zero', () => {
      const position = createMinimalPosition({
        size: PositionSize.fromFloat(10000),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        CollateralAmount.fromFloat(0),
        maxLeverage
      );

      expect($decimalValue(liqPrice).toFloat()).toBeCloseTo(50000, 0);
    });

    it('returns entry price when hypothetical collateral is negative', () => {
      const position = createMinimalPosition({
        size: PositionSize.fromFloat(10000),
        entryPrice: OraclePrice.fromFloat(50000),
      });

      const negativeCollateral = { ...CollateralAmount.fromFloat(100), value: '-100000000' };

      const liqPrice = calculateLiquidationPriceForCollateral(
        position,
        negativeCollateral as CollateralAmount,
        maxLeverage
      );

      expect($decimalValue(liqPrice).toFloat()).toBeCloseTo(50000, 0);
    });
  });
});

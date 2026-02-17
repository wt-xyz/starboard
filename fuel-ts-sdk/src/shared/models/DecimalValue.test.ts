import { describe, expect, it } from 'vitest';
import {
  $decimalValue,
  createDecimalValueSchema,
  DecimalValue,
  isDecimalValue,
} from './DecimalValue';
import { CollateralAmount, OraclePrice, PercentageMultiplier, Usdc, UsdValue } from './decimals';

describe('DecimalValue', () => {
  describe('construction', () => {
    it('should create from bigint', () => {
      const value = UsdValue.fromBigInt(100000000000n); // 100.0 with 9 decimals

      expect(value.value).toBe('100000000000');
      expect(value.decimals).toBe(9);
    });

    it('should create from float', () => {
      const value = UsdValue.fromFloat(123.456);

      expect($decimalValue(value).toFloat()).toBeCloseTo(123.456, 3);
    });

    it('should create schema with custom decimals', () => {
      const TestDecimal = createDecimalValueSchema(18, 'TestDecimal');

      const value = TestDecimal.fromBigInt(100n);
      expect(value.decimals).toBe(18);
    });

    it('should create from bigint string', () => {
      const value = UsdValue.fromBigIntString('100000000000');

      expect(value.value).toBe('100000000000');
      expect(value.decimals).toBe(9);
      expect($decimalValue(value).toFloat()).toBeCloseTo(100, 6);
    });

    it('should normalize scientific notation in bigint string', () => {
      const value = UsdValue.fromBigIntString('1e11');

      expect(value.value).toBe('100000000000');
      expect($decimalValue(value).toFloat()).toBeCloseTo(100, 6);
    });

    it('should use default unbranded schema via DecimalValue export', () => {
      const value = DecimalValue.fromFloat(42.5);

      expect(value.decimals).toBe(9);
      expect($decimalValue(value).toFloat()).toBeCloseTo(42.5, 6);
    });
  });

  describe('conversion', () => {
    it('should convert to float', () => {
      const value = UsdValue.fromBigInt(123456789000n); // 123.456789 with 9 decimals

      expect($decimalValue(value).toFloat()).toBeCloseTo(123.456789, 6);
    });

    it('should convert to bigint', () => {
      const value = UsdValue.fromFloat(100.5);

      expect($decimalValue(value).toBigInt()).toBe(100500000000n);
    });

    it('should handle zero', () => {
      const value = UsdValue.fromFloat(0);

      expect($decimalValue(value).toFloat()).toBe(0);
      expect($decimalValue(value).toBigInt()).toBe(0n);
    });

    it('should handle negative values', () => {
      const value = UsdValue.fromFloat(-50.5);

      expect($decimalValue(value).toFloat()).toBeCloseTo(-50.5, 6);
    });

    it('should convert zero-decimal schema to float', () => {
      const value = PercentageMultiplier.fromBigInt(42n);

      expect($decimalValue(value).toFloat()).toBe(42);
    });

    it('should round-trip through bigint string', () => {
      const original = UsdValue.fromFloat(99.99);
      const bigIntStr = $decimalValue(original).toBigInt().toString();
      const restored = UsdValue.fromBigIntString(bigIntStr);

      expect($decimalValue(restored).toFloat()).toBeCloseTo(99.99, 6);
    });
  });

  describe('adjustTo', () => {
    it('should adjust to same decimals', () => {
      const value = UsdValue.fromFloat(100);
      const adjusted = $decimalValue(value).adjustTo(UsdValue);

      expect(adjusted.value).toBe(value.value);
      expect(adjusted.decimals).toBe(UsdValue.decimals);
    });

    it('should adjust to higher decimals', () => {
      // UsdValue has 9 decimals, OraclePrice has 18
      const value = UsdValue.fromFloat(100);
      const adjusted = $decimalValue(value).adjustTo(OraclePrice);

      expect($decimalValue(adjusted).toFloat()).toBeCloseTo(100, 6);
      expect(adjusted.decimals).toBe(OraclePrice.decimals);
    });

    it('should adjust to lower decimals', () => {
      // OraclePrice has 18 decimals, CollateralAmount has 6
      const value = OraclePrice.fromFloat(100);
      const adjusted = $decimalValue(value).adjustTo(CollateralAmount);

      expect($decimalValue(adjusted).toFloat()).toBeCloseTo(100, 6);
      expect(adjusted.decimals).toBe(CollateralAmount.decimals);
    });

    it('should handle precision loss when reducing decimals', () => {
      const value = OraclePrice.fromFloat(100.123456789012345);
      const adjusted = $decimalValue(value).adjustTo(CollateralAmount);

      // CollateralAmount has 6 decimals, we lose precision beyond that
      expect($decimalValue(adjusted).toFloat()).toBeCloseTo(100.123456, 5);
    });

    it('should adjust from zero-decimal schema to higher precision', () => {
      const value = PercentageMultiplier.fromBigInt(50n);
      const adjusted = $decimalValue(value).adjustTo(UsdValue);

      expect(adjusted.decimals).toBe(9);
      expect($decimalValue(adjusted).toFloat()).toBeCloseTo(50, 6);
    });

    it('should adjust to zero-decimal schema', () => {
      const value = UsdValue.fromFloat(42.999);
      const adjusted = $decimalValue(value).adjustTo(PercentageMultiplier);

      expect(adjusted.decimals).toBe(0);
      // Truncates fractional part (integer division), not rounding
      expect($decimalValue(adjusted).toFloat()).toBe(42);
    });

    it('should preserve value when adjusting between same-precision schemas', () => {
      // CollateralAmount and Usdc both have 6 decimals
      const value = CollateralAmount.fromFloat(123.456);
      const adjusted = $decimalValue(value).adjustTo(Usdc);

      expect(adjusted.decimals).toBe(6);
      expect(adjusted.value).toBe(value.value);
    });

    it('should handle zero value adjustment across precisions', () => {
      const value = OraclePrice.fromBigInt(0n);
      const adjusted = $decimalValue(value).adjustTo(CollateralAmount);

      expect($decimalValue(adjusted).toFloat()).toBe(0);
      expect(adjusted.decimals).toBe(6);
    });
  });

  describe('toDecimalString', () => {
    it('should convert to decimal string', () => {
      const value = UsdValue.fromFloat(123.456);

      expect($decimalValue(value).toDecimalString()).toBe('123.456');
    });

    it('should handle whole numbers', () => {
      const value = UsdValue.fromFloat(100);

      expect($decimalValue(value).toDecimalString()).toBe('100');
    });

    it('should handle small decimals', () => {
      const value = UsdValue.fromFloat(0.001);

      expect($decimalValue(value).toDecimalString()).toBe('0.001');
    });

    it('should handle zero decimals schema without adding decimal point', () => {
      const ZeroDecimalSchema = createDecimalValueSchema(0, 'ZeroDecimal');
      const value = ZeroDecimalSchema.fromBigInt(12345n);

      expect($decimalValue(value).toDecimalString()).toBe('12345');
    });

    it('should strip trailing zeros after decimal point', () => {
      // 1.500000000 with 9 decimals -> "1.5"
      const value = UsdValue.fromBigInt(1500000000n);

      expect($decimalValue(value).toDecimalString()).toBe('1.5');
    });

    it('should handle zero value', () => {
      const value = UsdValue.fromBigInt(0n);

      expect($decimalValue(value).toDecimalString()).toBe('0');
    });

    it('should handle value less than one', () => {
      // 0.000000001 with 9 decimals = 1n raw
      const value = UsdValue.fromBigInt(1n);

      expect($decimalValue(value).toDecimalString()).toBe('0.000000001');
    });

    it('should handle high-precision schema', () => {
      const value = OraclePrice.fromFloat(1.5);

      expect($decimalValue(value).toDecimalString()).toBe('1.5');
    });

    it('should produce string that round-trips through fromDecimalString', () => {
      const original = UsdValue.fromFloat(42.123);
      const str = $decimalValue(original).toDecimalString();
      const restored = UsdValue.fromDecimalString(str);

      expect(restored.value).toBe(original.value);
    });
  });

  describe('fromDecimalString', () => {
    it('should parse decimal string', () => {
      const value = UsdValue.fromDecimalString('123.456');

      expect($decimalValue(value).toFloat()).toBeCloseTo(123.456, 3);
    });

    it('should parse whole number string', () => {
      const value = UsdValue.fromDecimalString('100');

      expect($decimalValue(value).toFloat()).toBe(100);
    });

    it('should parse string with more decimals than schema and truncate', () => {
      // UsdValue has 9 decimals, provide 12
      const value = UsdValue.fromDecimalString('1.123456789012');

      // Only first 9 decimal places should be kept
      expect(value.value).toBe('1123456789');
    });

    it('should parse string with fewer decimals and pad with zeros', () => {
      // UsdValue has 9 decimals, provide 3
      const value = UsdValue.fromDecimalString('1.5');

      expect(value.value).toBe('1500000000');
      expect($decimalValue(value).toFloat()).toBeCloseTo(1.5, 6);
    });

    it('should parse zero string', () => {
      const value = UsdValue.fromDecimalString('0');

      expect($decimalValue(value).toFloat()).toBe(0);
      expect($decimalValue(value).toBigInt()).toBe(0n);
    });

    it('should parse string with zero decimal part', () => {
      const value = UsdValue.fromDecimalString('5.0');

      expect($decimalValue(value).toFloat()).toBe(5);
    });

    it('should parse into zero-decimal schema', () => {
      const value = PercentageMultiplier.fromDecimalString('42');

      expect($decimalValue(value).toFloat()).toBe(42);
      expect(value.value).toBe('42');
    });

    it('should parse decimal string for zero-decimal schema and truncate fractional part', () => {
      const value = PercentageMultiplier.fromDecimalString('42.99');

      // Zero decimals means decimalPart is truncated to 0 chars
      expect(value.value).toBe('42');
    });
  });

  describe('isDecimalValue', () => {
    it('should return true for a valid decimal value instance', () => {
      const value = UsdValue.fromFloat(100);

      expect(isDecimalValue(value)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isDecimalValue(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isDecimalValue(undefined)).toBe(false);
    });

    it('should return false for a primitive', () => {
      expect(isDecimalValue(42)).toBe(false);
      expect(isDecimalValue('hello')).toBe(false);
    });

    it('should return false for an object missing decimals', () => {
      expect(isDecimalValue({ value: '100' })).toBe(false);
    });

    it('should return false for an object missing value', () => {
      expect(isDecimalValue({ decimals: 9 })).toBe(false);
    });

    it('should return true for a plain object with value and decimals', () => {
      expect(isDecimalValue({ value: '100', decimals: 9 })).toBe(true);
    });

    it('should validate precision when specified', () => {
      const value = UsdValue.fromFloat(100);

      expect(isDecimalValue(value, 9)).toBe(true);
      expect(isDecimalValue(value, 18)).toBe(false);
    });

    it('should accept any precision when not specified', () => {
      const usd = UsdValue.fromFloat(100);
      const oracle = OraclePrice.fromFloat(100);

      expect(isDecimalValue(usd)).toBe(true);
      expect(isDecimalValue(oracle)).toBe(true);
    });
  });

  describe('schema properties', () => {
    it('should expose decimals on schema', () => {
      expect(UsdValue.decimals).toBe(9);
      expect(OraclePrice.decimals).toBe(18);
      expect(CollateralAmount.decimals).toBe(6);
      expect(PercentageMultiplier.decimals).toBe(0);
    });

    it('should expose brand on schema', () => {
      expect(UsdValue.__brand).toBe('UsdValue');
      expect(OraclePrice.__brand).toBe('OraclePrice');
      expect(CollateralAmount.__brand).toBe('CollateralAmount');
    });

    it('should default to unbranded when no brand is provided', () => {
      const schema = createDecimalValueSchema(9);

      expect(schema.__brand).toBe('unbranded');
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const value = UsdValue.fromFloat(1e15);

      expect($decimalValue(value).toFloat()).toBe(1e15);
    });

    it('should handle very small numbers', () => {
      const value = UsdValue.fromFloat(0.000001);

      expect($decimalValue(value).toFloat()).toBeCloseTo(0.000001, 6);
    });

    it('should handle maximum safe integer', () => {
      const maxSafe = UsdValue.fromFloat(Number.MAX_SAFE_INTEGER);

      // Due to floating point precision, we can't expect exact match
      // Just verify it's approximately correct
      const expected = BigInt(Number.MAX_SAFE_INTEGER) * 1000000000n; // 9 decimals
      const diff =
        BigInt(maxSafe.value) > expected
          ? BigInt(maxSafe.value) - expected
          : expected - BigInt(maxSafe.value);

      // Allow up to 0.1% difference due to floating point precision
      expect(diff).toBeLessThan(expected / 1000n);
    });

    it('should handle single unit (smallest representable value)', () => {
      const value = UsdValue.fromBigInt(1n);

      expect($decimalValue(value).toFloat()).toBe(1e-9);
      expect($decimalValue(value).toBigInt()).toBe(1n);
    });

    it('should handle negative bigint construction', () => {
      const value = UsdValue.fromBigInt(-1000000000n);

      expect($decimalValue(value).toFloat()).toBe(-1);
    });

    it('should handle very large bigint value in high-precision schema', () => {
      // 1 with 18 decimals
      const value = OraclePrice.fromBigInt(1000000000000000000n);

      expect($decimalValue(value).toFloat()).toBe(1);
    });

    it('should preserve precision through adjust round-trip at same precision', () => {
      const original = CollateralAmount.fromFloat(123.456789);
      const toHigher = $decimalValue(original).adjustTo(OraclePrice);
      const backToLower = $decimalValue(toHigher).adjustTo(CollateralAmount);

      expect(backToLower.value).toBe(original.value);
    });
  });
});

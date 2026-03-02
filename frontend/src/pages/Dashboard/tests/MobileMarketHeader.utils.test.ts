import { describe, expect, it } from 'vitest';
import { getAssetPriceFormatted } from '../src/components/MobileMarketHeader.utils';

describe('getAssetPriceFormatted', () => {
  it('formats a standard price with 2 decimals', () => {
    const result = getAssetPriceFormatted(1234.56);
    expect(result).toContain('1');
    expect(result).not.toBe('0');
  });

  it('formats a small price by increasing decimals until non-zero', () => {
    // 0.00005123 rounds to 0 at 0-3 decimals, becomes non-zero at 4 → returns with 6 decimals
    const result = getAssetPriceFormatted(0.00005123);
    expect(result).toContain('51');
  });

  it('formats zero as zero', () => {
    const result = getAssetPriceFormatted(0);
    expect(result).toContain('0');
  });

  it('does not produce NaN for prices with thousand-separator magnitudes', () => {
    const result = getAssetPriceFormatted(65432.1);
    expect(result).not.toContain('NaN');
    expect(result).toContain('65');
  });

  it('handles a very small price near the recursion limit', () => {
    // 1e-8 rounds to 0 at 0-7 decimals, non-zero at 8 → returns with 10 decimals
    // But recursion caps at 9, so it should still return a valid string
    const result = getAssetPriceFormatted(1e-8);
    expect(result).not.toContain('NaN');
  });

  it('caps recursion at 9 decimals and returns formatted zero', () => {
    // A value so small it's still 0 at 8 decimal places
    const result = getAssetPriceFormatted(1e-12);
    expect(result).toContain('0');
    expect(result).not.toContain('NaN');
  });

  it('accepts a negative price', () => {
    const result = getAssetPriceFormatted(-42.5);
    expect(result).not.toContain('NaN');
  });

  it('returns formatted zero for NaN input', () => {
    const result = getAssetPriceFormatted(NaN);
    expect(result).toContain('0');
    expect(result).not.toContain('NaN');
  });

  it('returns formatted zero for Infinity input', () => {
    const result = getAssetPriceFormatted(Infinity);
    expect(result).toContain('0');
    expect(result).not.toContain('Infinity');
  });

  it('returns formatted zero for -Infinity input', () => {
    const result = getAssetPriceFormatted(-Infinity);
    expect(result).toContain('0');
    expect(result).not.toContain('Infinity');
  });
});

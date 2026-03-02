import { formatCurrency } from '@/lib/formatCurrency';

export function getAssetPriceFormatted(value: number, currentDecimal = 0): string {
  if (!Number.isFinite(value)) return formatCurrency(0);
  if (currentDecimal >= 9) return formatCurrency(0);
  if (Number(value.toFixed(currentDecimal)) === 0)
    return getAssetPriceFormatted(value, currentDecimal + 1);
  return formatCurrency(value, { decimals: currentDecimal + 2 });
}

import { $decimalValue, OraclePrice } from 'fuel-ts-sdk';
import type { AssetPriceEntity, Candle } from 'fuel-ts-sdk/trading';

const TWENTY_FOUR_HOURS_S = 24 * 60 * 60;
const MAX_CANDLE_DISTANCE_S = 2 * 60 * 60; // Reject candles > 2h from target

export function calculatePriceChange(
  currentPrice: AssetPriceEntity | undefined,
  candles: Candle[] | undefined
): number | null {
  if (!currentPrice || !candles || candles.length === 0) return null;

  const now = Date.now() / 1000;
  const target = now - TWENTY_FOUR_HOURS_S;

  // Find the candle closest to 24h ago (candles are ordered oldest-first)
  let closest = candles[0];
  for (const c of candles) {
    if (Math.abs(c.startedAt - target) < Math.abs(closest.startedAt - target)) {
      closest = c;
    }
  }

  // Reject if closest candle is too far from the 24h target
  if (Math.abs(closest.startedAt - target) > MAX_CANDLE_DISTANCE_S) return null;

  const current = $decimalValue(currentPrice.value).toFloat();
  const open = $decimalValue(OraclePrice.fromBigIntString(closest.openPrice)).toFloat();

  if (open === 0) return null;
  return (current - open) / open;
}

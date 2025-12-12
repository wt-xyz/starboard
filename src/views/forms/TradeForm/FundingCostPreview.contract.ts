/**
 * Contract for FundingCostPreview Component Data Requirements
 *
 * This contract specifies the data that must be provided to the FundingCostPreview component.
 * This abstraction allows the frontend to work independently of the SDK's internal repository
 * structure, which may change or be removed in future versions.
 *
 * When the repository is no longer exported from the SDK, implementers should provide
 * data conforming to this contract through alternative means (e.g., direct API calls,
 * different SDK methods, or state management).
 */
import { OrderSide } from 'starboard-client-js';

import { type BigNumberish } from '@/lib/numbers';

/**
 * Funding rate data required for funding cost calculations.
 *
 * The funding rate represents the periodic payment rate (typically per 8-hour interval)
 * that determines whether a position pays or receives funding fees.
 *
 * @property nextFundingRate - The current/next funding rate as a decimal (e.g., 0.0001 = 0.01% per 8h).
 *                             Can be positive (longs pay shorts) or negative (shorts pay longs).
 *                             Null/undefined indicates funding rate is unavailable.
 */
export interface FundingRateData {
  /**
   * The next funding rate as a BigNumberish value (string, number, or BigNumber).
   * This is the rate that will be applied at the next funding interval (typically every 8 hours).
   *
   * Example values:
   * - "0.0001" = 0.01% per 8h (longs pay shorts)
   * - "-0.00005" = -0.005% per 8h (shorts pay longs)
   * - "0" = no funding payment
   * - null/undefined = funding rate unavailable
   */
  nextFundingRate: BigNumberish | null | undefined;
}

/**
 * Position notional value data required for funding cost calculations.
 *
 * The notional value represents the total USD value of the position, which is used
 * to calculate the absolute funding payment amounts.
 *
 * @property notional - The position notional value in USDC.
 *                      Null/undefined indicates position size is unavailable or not yet determined.
 */
export interface PositionNotionalData {
  /**
   * The position notional value in USDC as a BigNumberish value.
   * This is the total USD value of the position (size × price).
   *
   * Example values:
   * - "1000" = $1,000 position
   * - "50000.5" = $50,000.50 position
   * - null/undefined = position size unavailable
   */
  notional: BigNumberish | null | undefined;
}

/**
 * Order side data required for determining funding direction.
 *
 * The order side determines whether the position is long (BUY) or short (SELL),
 * which affects whether the position pays or receives funding.
 *
 * @property side - The order side (BUY for long, SELL for short).
 *                  Null/undefined indicates order side is not yet determined.
 */
export interface OrderSideData {
  /**
   * The order side indicating position direction.
   * - OrderSide.BUY = Long position (will pay funding if rate is positive)
   * - OrderSide.SELL = Short position (will receive funding if rate is positive)
   * - null/undefined = order side not yet determined
   */
  side: OrderSide | null | undefined;
}

/**
 * Complete data contract for FundingCostPreview component.
 *
 * This interface combines all data requirements needed to render the funding cost preview.
 * Implementers must provide all three data sources to fully support the component.
 *
 * @example
 * ```typescript
 * const fundingData: FundingCostPreviewDataContract = {
 *   fundingRate: {
 *     nextFundingRate: "0.0001" // 0.01% per 8h
 *   },
 *   positionNotional: {
 *     notional: "10000" // $10,000 position
 *   },
 *   orderSide: {
 *     side: OrderSide.BUY // Long position
 *   }
 * };
 * ```
 */
export interface FundingCostPreviewDataContract {
  /**
   * Funding rate information for the current market.
   * Required for:
   * - Displaying current funding rate
   * - Calculating funding projections (1d, 7d, 30d)
   * - Determining funding direction (pay/receive/flat)
   */
  fundingRate: FundingRateData;

  /**
   * Position notional value in USDC.
   * Required for:
   * - Displaying position notional
   * - Calculating absolute funding payment amounts
   * - Computing funding projections
   */
  positionNotional: PositionNotionalData;

  /**
   * Order side (BUY/SELL) for the trade.
   * Required for:
   * - Determining funding direction (whether position pays or receives funding)
   * - Displaying correct funding direction indicator
   */
  orderSide: OrderSideData;
}

/**
 * Type guard to check if funding rate data is available.
 */
export function hasFundingRateData(
  data: FundingRateData
): data is FundingRateData & { nextFundingRate: NonNullable<FundingRateData['nextFundingRate']> } {
  return data.nextFundingRate != null;
}

/**
 * Type guard to check if position notional data is available.
 */
export function hasPositionNotionalData(
  data: PositionNotionalData
): data is PositionNotionalData & {
  notional: NonNullable<PositionNotionalData['notional']>;
} {
  return data.notional != null;
}

/**
 * Type guard to check if order side data is available.
 */
export function hasOrderSideData(
  data: OrderSideData
): data is OrderSideData & { side: NonNullable<OrderSideData['side']> } {
  return data.side != null;
}

/**
 * Type guard to check if complete funding cost preview data is available.
 */
export function hasCompleteFundingCostData(
  data: FundingCostPreviewDataContract
): data is FundingCostPreviewDataContract & {
  fundingRate: FundingRateData & {
    nextFundingRate: NonNullable<FundingRateData['nextFundingRate']>;
  };
  positionNotional: PositionNotionalData & {
    notional: NonNullable<PositionNotionalData['notional']>;
  };
  orderSide: OrderSideData & { side: NonNullable<OrderSideData['side']> };
} {
  return (
    hasFundingRateData(data.fundingRate) &&
    hasPositionNotionalData(data.positionNotional) &&
    hasOrderSideData(data.orderSide)
  );
}

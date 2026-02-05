import type { DecimalValueInstance } from '@sdk/shared/models/DecimalValue';
import type { CollateralAmount } from '@sdk/shared/models/decimals';
import { OraclePrice } from '@sdk/shared/models/decimals';
import { DecimalCalculator, zero } from '@sdk/shared/utils/DecimalCalculator';
import type { PositionEntity } from '../PositionsEntity';
import { PositionSide } from '../PositionsEntity';

export function calculateLiquidationPriceForCollateral(
  position: PositionEntity,
  collateral: CollateralAmount,
  maxLeverage: DecimalValueInstance
): OraclePrice {
  if (position.size.value === '0' || position.entryPrice.value === '0') {
    return zero(OraclePrice);
  }

  if (BigInt(maxLeverage.value) <= 0n) {
    return zero(OraclePrice);
  }

  if (BigInt(collateral.value) <= 0n) {
    return position.entryPrice;
  }

  const minCollateral = DecimalCalculator.value(position.size)
    .divideBy(maxLeverage)
    .calculate(OraclePrice);

  const availableForLoss = DecimalCalculator.value(collateral)
    .subtractBy(minCollateral)
    .calculate(OraclePrice);

  if (BigInt(availableForLoss.value) <= 0n) {
    return position.entryPrice;
  }

  const priceChange = DecimalCalculator.value(availableForLoss)
    .multiplyBy(position.entryPrice)
    .divideBy(position.size)
    .calculate(OraclePrice);

  if (position.side === PositionSide.LONG) {
    return DecimalCalculator.value(position.entryPrice)
      .subtractBy(priceChange)
      .calculate(OraclePrice);
  } else {
    return DecimalCalculator.value(position.entryPrice).add(priceChange).calculate(OraclePrice);
  }
}

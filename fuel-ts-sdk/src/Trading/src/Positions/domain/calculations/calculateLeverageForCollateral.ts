import type { DecimalValueInstance } from '@sdk/shared/models/DecimalValue';
import { DecimalValue } from '@sdk/shared/models/DecimalValue';
import type { CollateralAmount } from '@sdk/shared/models/decimals';
import { DecimalCalculator, zero } from '@sdk/shared/utils/DecimalCalculator';
import type { PositionEntity } from '../PositionsEntity';

export function calculateLeverageForCollateral(
  position: PositionEntity,
  collateral: CollateralAmount
): DecimalValueInstance {
  if (collateral.value === '0' || BigInt(collateral.value) <= 0n) {
    return zero(DecimalValue);
  }

  return DecimalCalculator.value(position.size).divideBy(collateral).calculate(DecimalValue);
}

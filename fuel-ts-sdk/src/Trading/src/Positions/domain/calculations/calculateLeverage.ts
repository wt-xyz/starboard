import type { DecimalValueInstance } from '@sdk/shared/models/DecimalValue';
import { DecimalValue } from '@sdk/shared/models/DecimalValue';
import { DecimalCalculator, zero } from '@sdk/shared/utils/DecimalCalculator';
import type { PositionEntity } from '../PositionsEntity';

export function calculateLeverage(position: PositionEntity): DecimalValueInstance {
  if (position.collateral.value === '0') {
    return zero(DecimalValue);
  }

  return DecimalCalculator.value(position.size)
    .divideBy(position.collateral)
    .calculate(DecimalValue);
}

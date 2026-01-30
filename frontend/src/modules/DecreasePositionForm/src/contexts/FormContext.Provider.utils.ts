import { $decimalValue, DecimalCalculator, RatioOutput } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';

export function calculateSliderPercentage(
  sizeToDecrease: string,
  totalPositionSize: string
): string {
  if (!sizeToDecrease || totalPositionSize === '0' || totalPositionSize === '') return '0';

  const totalAsPositionSize = PositionSize.fromDecimalString(totalPositionSize);

  const percentage = $decimalValue(
    DecimalCalculator.value(PositionSize.fromDecimalString(sizeToDecrease))
      .multiplyBy(RatioOutput.fromFloat(100))
      .divideBy(totalAsPositionSize)
      .calculate()
  ).toDecimalString();

  const percentageNum = Number(percentage);
  if (percentageNum <= 0) return '0';
  if (percentageNum >= 100) return '100';

  return percentage;
}

export function calculateSizeFromPercentage(
  percentage: string,
  totalPositionSize: string
): string {
  if (percentage === '0' || totalPositionSize === '0' || totalPositionSize === '') return '0';

  const totalAsPositionSize = PositionSize.fromDecimalString(totalPositionSize);
  const nextPercentageValue = RatioOutput.fromDecimalString(percentage);
  const nextSizeToDecrease = DecimalCalculator.value(totalAsPositionSize)
    .multiplyBy(nextPercentageValue)
    .divideBy(RatioOutput.fromFloat(100))
    .calculate();

  const result = $decimalValue(nextSizeToDecrease).toDecimalString();
  return result === '0' ? '0' : result;
}

import { type FC, use, useCallback } from 'react';
import { $decimalValue, DecimalCalculator, DecimalValue } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { useController } from 'react-hook-form';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import { DecreasePositionForm } from '@/pages/Dashboard/submodules';
import * as $ from './SizeInputSection.css';

export interface SizeInputSectionProps {
  totalPositionSize: PositionSize;
}

export const SizeInputSection: FC<SizeInputSectionProps> = ({ totalPositionSize }) => {
  const tradingSdk = useTradingSdk();
  const { control } = use(DecreasePositionForm.KernelContext)!;
  const { field } = useController({ control, name: 'sizeDelta' });

  const assetPrice = (() => {
    const price = tradingSdk.getWatchedAssetLatestPrice();
    return price ? $decimalValue(price.value).toFloat() : undefined;
  })();

  const handleHalf = useCallback(() => {
    const half = DecimalCalculator.value(totalPositionSize)
      .divideBy(DecimalValue.fromFloat(2))
      .calculate(PositionSize);
    field.onChange($decimalValue(half).toDecimalString());
  }, [field, totalPositionSize]);

  const handleMax = useCallback(() => {
    field.onChange($decimalValue(totalPositionSize).toDecimalString());
  }, [field, totalPositionSize]);

  return (
    <div className={$.inputSection}>
      <DecreasePositionForm.SizeInput
        assetPrice={assetPrice}
        onHalf={handleHalf}
        onMax={handleMax}
        showLeverage
        calculateUsdValue={calculateUsdValue}
      />
    </div>
  );
};

function calculateUsdValue(fieldValue: string, assetPrice: number, leverage: string) {
  if (!fieldValue || !leverage) return null;
  return $decimalValue(
    DecimalCalculator.value(DecimalValue.fromDecimalString(fieldValue))
      .multiplyBy(DecimalValue.fromFloat(assetPrice))
      .divideBy(DecimalValue.fromDecimalString(leverage))
      .calculate(DecimalValue)
  ).toDecimalString();
}

import { type FC, use, useCallback } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { SizeInput, type SizeInputUsdCalculator } from '@/modules/PositionForm';
import { KernelContext, OptionsContext } from '../contexts';

export const AmountInput: FC = () => {
  const { control } = use(KernelContext)!;
  const options = use(OptionsContext);
  const { field: actionField } = useController({ control, name: 'action' });
  const { field: amountField } = useController({ control, name: 'amount' });
  const maxAmount = useWatch({ control, name: 'maxAmount' });

  const label = actionField.value === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount';

  const handleHalf = useCallback(() => {
    amountField.onChange(String(maxAmount / 2));
  }, [amountField, maxAmount]);

  const handleMax = useCallback(() => {
    amountField.onChange(String(maxAmount));
  }, [amountField, maxAmount]);

  return (
    <SizeInput
      fieldName="amount"
      label={label}
      assetSymbol={options.baseAssetSymbol}
      calculateUsdValue={calculateUsdValue}
      onHalf={handleHalf}
      onMax={handleMax}
    />
  );
};

function calculateUsdValue(
  fieldValue: string,
  assetPrice: number
): ReturnType<SizeInputUsdCalculator> {
  if (!fieldValue) return null;
  const value = parseFloat(fieldValue);
  if (isNaN(value)) return null;
  return String(value * assetPrice);
}

import { FC } from 'react';

import { useController } from 'react-hook-form';
import { NumberFormatValues } from 'react-number-format';

import { ButtonSize } from '@/constants/buttons';

import { useRequiredContext } from '@/hooks/useRequiredContext';

import { DetailsItem } from '@/components/Details';
import { FormInput } from '@/components/FormInput';
import { FormMaxInputToggleButton } from '@/components/FormMaxInputToggleButton';
import { InputType } from '@/components/Input';
import { WithDetailsReceipt } from '@/components/WithDetailsReceipt';

import { VaultFormContext } from '../../contexts/VaultForm.context';

type AmountInputProps = {
  label: string;
  disabled: boolean;
  maxAmount: string;
  receiptItems: DetailsItem[];
};

export const AmountInput: FC<AmountInputProps> = ({ label, disabled, maxAmount, receiptItems }) => {
  const { control } = useRequiredContext(VaultFormContext);
  const { field } = useController({ control, name: 'amountInUsdString' });
  const isFilled = !!field.value;

  const handleAmountChange = (change: NumberFormatValues) => {
    if (change.floatValue) field.onChange(change.value);
  };

  const handleMaxClick = () => {
    if (isFilled) field.onChange('');
    else field.onChange(maxAmount);
  };

  const MaxToggleButton = (
    <FormMaxInputToggleButton
      size={ButtonSize.XSmall}
      isInputEmpty={!isFilled}
      isLoading={false}
      disabled={disabled}
      onPressedChange={handleMaxClick}
    />
  );

  return (
    <WithDetailsReceipt side="bottom" detailItems={receiptItems}>
      <FormInput
        type={InputType.Currency}
        label={label}
        value={field.value}
        onChange={handleAmountChange}
        disabled={disabled}
        slotRight={MaxToggleButton}
      />
    </WithDetailsReceipt>
  );
};

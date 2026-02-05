import { type FC, use, useCallback } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { formatCurrency } from '@/lib/formatCurrency';
import { KernelContext, OptionsContext } from '../contexts';
import * as $ from './AmountInput.css';

export const AmountInput: FC = () => {
  const { control } = use(KernelContext)!;
  const options = use(OptionsContext);
  const { field: actionField } = useController({ control, name: 'action' });
  const { field: amountField, fieldState } = useController({ control, name: 'amount' });
  const maxAmount = useWatch({ control, name: 'maxAmount' });

  const label = actionField.value === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount';

  const handleHalf = useCallback(() => {
    amountField.onChange(String(maxAmount / 2));
  }, [amountField, maxAmount]);

  const handleMax = useCallback(() => {
    amountField.onChange(String(maxAmount));
  }, [amountField, maxAmount]);

  const handleChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      amountField.onChange(value.slice(0, 13));
    }
  };

  const usdValue = amountField.value ? formatCurrency(amountField.value) : null;

  return (
    <div className={$.container}>
      <label className={$.label}>{label}</label>
      <div className={$.inputWrapper}>
        <input
          type="text"
          inputMode="decimal"
          className={$.input}
          value={amountField.value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0.0"
        />
        <div className={$.assetBadge}>{options.baseAssetSymbol}</div>
      </div>
      <div className={$.footer}>
        <span className={$.usdValue}>{usdValue ? `$${usdValue}` : '$0.00'}</span>
        <div className={$.quickActions}>
          <button type="button" className={$.quickButton} onClick={handleHalf}>
            Half
          </button>
          <button type="button" className={$.quickButton} onClick={handleMax}>
            Max
          </button>
        </div>
      </div>
      {fieldState.error && <div className={$.error}>{fieldState.error.message}</div>}
    </div>
  );
};

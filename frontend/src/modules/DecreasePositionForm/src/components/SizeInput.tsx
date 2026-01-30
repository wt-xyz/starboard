import type { ChangeEvent, FC } from 'react';
import { useContext } from 'react';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { FormContext } from '../contexts/FormContext';
import { MetaContext } from '../contexts/MetaContext';
import * as $ from './SizeInput.css';

export const SizeInput: FC = () => {
  const { getFormData, updateSizeDeltaFromNumeric } = useRequiredContext(FormContext);
  const { quoteAssetSymbol } = useContext(MetaContext);

  const amountToDecrease = getFormData().sizeDeltaNumeric;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      updateSizeDeltaFromNumeric(value.slice(0, 13));
    }
  };

  return (
    <>
      <label htmlFor="decrease-amount-input" className={$.inputLabel}>
        Amount to Decrease
      </label>
      <div className={$.inputWrapper}>
        <input
          id="decrease-amount-input"
          type="text"
          inputMode="decimal"
          className={$.input}
          placeholder="0.00"
          value={amountToDecrease || ''}
          onChange={handleInputChange}
        />
        <span className={$.inputSuffix}>{quoteAssetSymbol}</span>
      </div>
    </>
  );
};

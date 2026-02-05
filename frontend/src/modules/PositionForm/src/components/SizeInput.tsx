import { type FC, type RefObject, use } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { formatCurrency } from '@/lib/formatCurrency';
import { KernelContext, OptionsContext } from '../contexts';
import type { PositionFormField } from '../models';
import { useFieldsAsserter } from '../utils';
import * as $ from './SizeInput.css';

type SizeInputProps = {
  fieldName?: PositionFormField;
  label?: string;
  showLeverage?: boolean;
  onHalf?: () => void;
  onMax?: () => void;
  ref?: RefObject<HTMLInputElement | null>;

  assetSymbol?: string;
  assetPrice?: number;
  calculateUsdValue?: SizeInputUsdCalculator;
};

export const SizeInput: FC<SizeInputProps> = ({
  fieldName = 'sizeDelta',
  label,
  showLeverage,
  onHalf,
  onMax,
  ref,

  assetSymbol: assetSymbolProp,
  assetPrice: assetPriceProp,
  calculateUsdValue,
}) => {
  useFieldsAsserter([fieldName], 'SizeInput');
  const { control } = use(KernelContext)!;
  const options = use(OptionsContext);

  const { field, fieldState } = useController({ control, name: fieldName });
  const leverage = useWatch({ control, name: 'leverage' });

  const assetSymbol =
    assetSymbolProp ?? options?.baseAssetSymbol ?? options?.quoteAssetSymbol ?? '';
  const assetPrice = assetPriceProp ?? options?.currentBaseAssetPrice?.value;
  const usdValue =
    calculateUsdValue && assetPrice
      ? calculateUsdValue(field.value ?? '', assetPrice, leverage ?? '')
      : null;

  const handleChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      field.onChange(value.slice(0, 13));
    }
  };

  return (
    <div className={$.container}>
      {label && <label className={$.label}>{label}</label>}
      <div className={$.inputWrapper}>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={$.input}
          value={field.value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0.0"
        />
        {assetSymbol && <div className={$.assetBadge}>{assetSymbol}</div>}
      </div>
      {(usdValue !== null || showLeverage || onHalf || onMax) && (
        <div className={$.footer}>
          <span className={$.usdValue}>
            {usdValue !== null ? <> ${formatCurrency(usdValue)}</> : <>$0.00</>}
          </span>
          {showLeverage && leverage && <span className={$.leverage}>Leverage: {leverage}x</span>}
          {(onHalf || onMax) && (
            <div className={$.quickActions}>
              {onHalf && (
                <button type="button" className={$.quickButton} onClick={onHalf}>
                  Half
                </button>
              )}
              {onMax && (
                <button type="button" className={$.quickButton} onClick={onMax}>
                  Max
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {fieldState.error && <div className={$.error}>{fieldState.error.message}</div>}
    </div>
  );
};

export type SizeInputUsdCalculator = (
  fieldValue: string,
  assetPrice: number,
  leverage: string
) => string | null;

import { type FC, use } from 'react';
import { $decimalValue, DecimalCalculator } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { useWatch } from 'react-hook-form';
import { formatNumber } from '@/lib/formatCurrency';
import { KernelContext, OptionsContext } from '../contexts';
import * as $ from './Summary.css';

export const Summary: FC = () => {
  const { control } = use(KernelContext)!;
  const { quoteAssetSymbol } = use(OptionsContext);

  const [sizeDelta, totalSize] = useWatch({ control, name: ['sizeDelta', 'totalSize'] });

  const remainingSize = (() => {
    if (!sizeDelta) return totalSize ?? '';

    const total = PositionSize.fromDecimalString(totalSize ?? '');
    const decrease = PositionSize.fromDecimalString(sizeDelta);
    const remaining = DecimalCalculator.value(total).subtractBy(decrease).calculate(PositionSize);

    return $decimalValue(remaining).toDecimalString();
  })();

  return (
    <>
      <div className={$.summaryRow}>
        <span className={$.summaryLabel}>Decrease Amount</span>
        <span className={$.summaryValue}>
          {formatNumber(sizeDelta ?? '')} {quoteAssetSymbol}
        </span>
      </div>
      <div className={$.summaryRow}>
        <span className={$.summaryLabel}>Remaining Size</span>
        <span className={$.summaryValue}>
          {formatNumber(remainingSize)} {quoteAssetSymbol}
        </span>
      </div>
    </>
  );
};

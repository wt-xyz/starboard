import type { FC } from 'react';
import { useContext } from 'react';
import { $decimalValue, DecimalCalculator } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { formatNumber } from '@/lib/formatCurrency';
import { FormContext } from '../contexts/FormContext';
import { MetaContext } from '../contexts/MetaContext';
import * as $ from './Summary.css';

export const Summary: FC = () => {
  const { getFormData } = useRequiredContext(FormContext);
  const { quoteAssetSymbol } = useContext(MetaContext);

  const { totalSizeNumeric, sizeDeltaNumeric } = getFormData();

  const remainingSize = (() => {
    if (!sizeDeltaNumeric) return totalSizeNumeric;

    const total = PositionSize.fromDecimalString(totalSizeNumeric);
    const decrease = PositionSize.fromDecimalString(sizeDeltaNumeric);
    const remaining = DecimalCalculator.value(total).subtractBy(decrease).calculate(PositionSize);

    return $decimalValue(remaining).toDecimalString();
  })();

  return (
    <>
      <div className={$.summaryRow}>
        <span className={$.summaryLabel}>Decrease Amount</span>
        <span className={$.summaryValue}>
          {formatNumber(sizeDeltaNumeric)} {quoteAssetSymbol}
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

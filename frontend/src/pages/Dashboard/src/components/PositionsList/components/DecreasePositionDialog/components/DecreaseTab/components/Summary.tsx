import { type FC, use } from 'react';
import { $decimalValue, DecimalCalculator, type PositionStableId } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { useWatch } from 'react-hook-form';
import { formatNumber } from '@/lib/formatCurrency';
import { DecreasePositionForm, PositionStats } from '@/pages/Dashboard/submodules';
import * as $ from './Summary.css';

export interface SummaryProps {
  positionId: PositionStableId;
}

export const Summary: FC<SummaryProps> = ({ positionId }) => {
  const { control } = use(DecreasePositionForm.KernelContext)!;
  const { quoteAssetSymbol } = use(DecreasePositionForm.OptionsContext);

  const [sizeDelta, totalSize] = useWatch({ control, name: ['sizeDelta', 'totalSize'] });

  const remainingSize = (() => {
    if (!sizeDelta) return totalSize ?? '';

    const total = PositionSize.fromDecimalString(totalSize ?? '');
    const decrease = PositionSize.fromDecimalString(sizeDelta);
    const remaining = DecimalCalculator.value(total).subtractBy(decrease).calculate(PositionSize);

    return $decimalValue(remaining).toDecimalString();
  })();

  const isFullClose = sizeDelta === totalSize || Number(sizeDelta) >= Number(totalSize);

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
      {isFullClose && (
        <div className={$.summaryRow}>
          <span className={$.summaryLabel}>Est. Payout</span>
          <span className={$.summaryValue}>
            <PositionStats.EstimatedPayout positionId={positionId} /> USDC
          </span>
        </div>
      )}
    </>
  );
};

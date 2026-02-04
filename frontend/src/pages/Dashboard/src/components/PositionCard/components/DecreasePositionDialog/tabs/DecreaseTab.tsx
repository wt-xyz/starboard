import { type FC, use, useCallback, useMemo } from 'react';
import { $decimalValue, DecimalCalculator, DecimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { useController } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as DecreasePositionForm from '@/modules/DecreasePositionForm';
import type { DecreasePositionFormModel } from '@/modules/DecreasePositionForm';
import * as $ from './DecreaseTab.css';

export interface DecreaseTabProps {
  positionId: PositionStableId;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
}

export const DecreaseTab: FC<DecreaseTabProps> = ({ positionId, onCancel, onSubmitSuccess }) => {
  const tradingSdk = useTradingSdk();

  const quoteAssetSymbol = tradingSdk.getWatchedAsset()?.name ?? '...';
  const baseAssetSymbol = 'USDC';

  const position = tradingSdk.getPositionById(positionId);
  if (!position) throw new Error('Position not found');

  const totalPositionSize = tradingSdk.getPositionSizeInQuoteAsset(position.stableId);
  const totalSizeNumeric = $decimalValue(totalPositionSize).toDecimalString();

  const positionLeverage = (() => {
    const size = $decimalValue(position.size).toFloat();
    const collateral = $decimalValue(position.collateral).toFloat();
    return collateral > 0 ? (size / collateral).toFixed(1) : '1';
  })();

  const handleSubmit = useCallback(
    async (formData: DecreasePositionFormModel) => {
      const isFullClose =
        formData.sizeDelta === formData.totalSize ||
        Number(formData.sizeDelta) >= Number(formData.totalSize);

      const sizeDelta = (() => {
        if (isFullClose) return position.size;

        const sizeDeltaInQuote = PositionSize.fromDecimalString(formData.sizeDelta);
        return DecimalCalculator.inNumerator((calc) =>
          calc.value(position.size).multiplyBy(sizeDeltaInQuote)
        )
          .divideBy(totalPositionSize)
          .calculate(PositionSize);
      })();

      try {
        await tradingSdk.decreasePosition({
          positionId,
          sizeDelta,
        });
        const actionPastTense = isFullClose ? 'closed' : 'decreased';
        toast.success(`Position ${actionPastTense} successfully`);
        onSubmitSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const action = isFullClose ? 'close' : 'decrease';
        toast.error(`Failed to ${action} position: ${message}`);
      }
    },
    [tradingSdk, positionId, onSubmitSuccess, totalPositionSize, position.size]
  );

  const getSubmitTitle = (percentage: string) =>
    percentage === '100' ? 'Close Position' : 'Decrease Position';

  const optionsContextValue: DecreasePositionForm.OptionsContextType = useMemo(
    () => ({ baseAssetSymbol, quoteAssetSymbol }),
    [baseAssetSymbol, quoteAssetSymbol]
  );

  return (
    <DecreasePositionForm.OptionsContext.Provider value={optionsContextValue}>
      <DecreasePositionForm.KernelProvider
        totalSize={totalSizeNumeric}
        leverage={positionLeverage}
        onSubmitFulfilled={handleSubmit}
      >
        <DecreasePositionForm.CurrentPositionInfo />

        <SizeInputSection totalPositionSize={totalPositionSize} />

        <div className={$.sliderSection}>
          <DecreasePositionForm.SizePercentageSlider />
        </div>

        <div css={$.summarySection}>
          <DecreasePositionForm.Summary />
        </div>

        <DecreasePositionForm.Actions onCancel={onCancel} submitTitleFn={getSubmitTitle} />
      </DecreasePositionForm.KernelProvider>
    </DecreasePositionForm.OptionsContext.Provider>
  );
};

interface SizeInputSectionProps {
  totalPositionSize: PositionSize;
}

const SizeInputSection: FC<SizeInputSectionProps> = ({ totalPositionSize }) => {
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

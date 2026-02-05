import { type FC, useCallback, useMemo } from 'react';
import { Button, Dialog } from '@radix-ui/themes';
import { $decimalValue, DecimalCalculator, type PositionStableId } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { toast } from 'react-toastify';
import { useSdkQuerySignal, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { DecreasePositionForm, type DecreasePositionFormModel } from '@/pages/Dashboard/submodules';
import * as $ from './DecreaseTab.css';
import { SizeInputSection } from './components/SizeInputSection';
import { Summary } from './components/Summary';

export interface DecreaseTabProps {
  positionId: PositionStableId;
  onSubmitSuccess?: () => void;
}

export const DecreaseTab: FC<DecreaseTabProps> = ({ positionId, onSubmitSuccess }) => {
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

  const currentQuoteAssetPrice = useSdkQuerySignal(() => {
    const price = tradingSdk.getWatchedAssetLatestPrice();
    return price ? $decimalValue(price.value).toFloat() : 0;
  });

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

  const optionsContextValue: DecreasePositionForm.OptionsContextType = useMemo(
    () => ({ baseAssetSymbol, quoteAssetSymbol, currentQuoteAssetPrice }),
    [baseAssetSymbol, quoteAssetSymbol, currentQuoteAssetPrice]
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
          <Summary positionId={positionId} />
        </div>

        <div className={$.actionsSection}>
          <Dialog.Close>
            <Button variant="outline" size="3" className={$.cancelButton}>
              Cancel
            </Button>
          </Dialog.Close>
          <DecreasePositionForm.SubmitButton />
        </div>
      </DecreasePositionForm.KernelProvider>
    </DecreasePositionForm.OptionsContext.Provider>
  );
};

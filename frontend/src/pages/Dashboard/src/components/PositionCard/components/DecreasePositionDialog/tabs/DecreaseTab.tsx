import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import { PositionSize } from 'fuel-ts-sdk/trading';
import { toast } from 'react-toastify';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import {
  DecreasePositionForm,
  type DecreasePositionFormModel,
} from '@/modules/DecreasePositionForm';
import * as $ from './DecreaseTab.css';

export interface DecreaseTabProps {
  positionId: PositionStableId;
  onSubmitSuccess?: () => void;
}

export const DecreaseTab: FC<DecreaseTabProps> = ({ positionId, onSubmitSuccess }) => {
  const tradingSdk = useTradingSdk();

  const quoteAssetSymbol = tradingSdk.getWatchedAsset()?.name ?? '...';
  const baseAssetSymbol = 'USDC';

  const position = tradingSdk.getPositionById(positionId);
  if (!position) {
    throw new Error('Position not found');
  }

  const totalPositionSize = tradingSdk.getPositionSizeInQuoteAsset(position.stableId);
  const totalSizeNumeric = $decimalValue(totalPositionSize).toDecimalString();

  const handleSubmit = useCallback(
    async (formData: DecreasePositionFormModel) => {
      const sizeDelta = PositionSize.fromDecimalString(formData.sizeDeltaNumeric);
      const isFullClose =
        formData.sizeDeltaNumeric === formData.totalSizeNumeric ||
        Number(formData.sizeDeltaNumeric) >= Number(formData.totalSizeNumeric);

      const action = isFullClose ? 'close' : 'decrease';
      const actionPastTense = isFullClose ? 'closed' : 'decreased';

      try {
        await tradingSdk.decreasePosition({
          positionId,
          sizeDelta,
        });
        toast.success(`Position ${actionPastTense} successfully`);
        onSubmitSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to ${action} position: ${message}`);
      }
    },
    [tradingSdk, positionId, onSubmitSuccess]
  );

  const getSubmitTitle = (percentage: string) =>
    percentage === '100' ? 'Close Position' : 'Decrease Position';

  const metaContextValue = useMemo(
    () => ({ baseAssetSymbol, quoteAssetSymbol }),
    [baseAssetSymbol, quoteAssetSymbol]
  );

  return (
    <DecreasePositionForm.MetaContext.Provider value={metaContextValue}>
      <DecreasePositionForm.FormContextProvider
        totalSize={totalSizeNumeric}
        onSubmit={handleSubmit}
      >
        <DecreasePositionForm.CurrentPositionInfo />

        <div className={$.inputSection}>
          <DecreasePositionForm.SizeInput />
        </div>

        <div className={$.sliderSection}>
          <DecreasePositionForm.SizeSlider />
        </div>

        <div css={$.summarySection}>
          <DecreasePositionForm.Summary />
        </div>

        <DecreasePositionForm.Actions submitTitleFn={getSubmitTitle} />
      </DecreasePositionForm.FormContextProvider>
    </DecreasePositionForm.MetaContext.Provider>
  );
};

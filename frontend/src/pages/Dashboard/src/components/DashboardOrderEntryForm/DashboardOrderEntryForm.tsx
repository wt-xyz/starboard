import { type FC, useCallback } from 'react';
import { Button } from '@radix-ui/themes';
import { CollateralAmount, DecimalValue } from 'fuel-ts-sdk';
import { toast } from 'react-toastify';
import { WalletContext } from '@/contexts/WalletContext';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import {
  IncreasePositionForm,
  type IncreasePositionFormModel,
  type OrderSide,
} from '@/pages/Dashboard/submodules';
import * as $ from './DashboardOrderEntryForm.css';

export type DashboardOrderEntryFormProps = {
  defaultOrderSide?: OrderSide;
  hideSideSwitch?: boolean;
};

export const DashboardOrderEntryForm: FC<DashboardOrderEntryFormProps> = ({
  defaultOrderSide,
  hideSideSwitch = false,
}) => {
  const tradingSdk = useTradingSdk();
  const wallet = useRequiredContext(WalletContext);

  const isWalletConnected = wallet.isUserConnected();

  const baseAsset = useSdkQuery(tradingSdk.getBaseAsset);
  const quoteAsset = useSdkQuery(tradingSdk.getWatchedAsset);

  const processOrder = useCallback(
    async (formData: IncreasePositionFormModel) => {
      if (!baseAsset || !quoteAsset)
        throw new Error(
          `Form is not ready for submission. All variables must be defined: baseAsset (${baseAsset}), quoteAsset (${quoteAsset})`
        );

      await tradingSdk.submitOrder({
        collateralAssetId: baseAsset?.assetId,
        indexAsset: quoteAsset.assetId,
        leverage: DecimalValue.fromDecimalString(formData.leverage),
        collateralAmount: CollateralAmount.fromDecimalString(formData.collateralSize),
        isLong: formData.orderSide === 'long',
      });
    },
    [baseAsset, quoteAsset, tradingSdk]
  );

  const handleOrderSubmission = useCallback(
    async (formData: IncreasePositionFormModel) => {
      const toastId = toast.info(
        'Your transaction is being submitted to the blockchain. Please wait...',
        { autoClose: false }
      );

      try {
        await processOrder(formData);
        toast.dismiss(toastId);
        toast.success('Your order has been submitted successfully!');
      } catch (err) {
        toast.dismiss(toastId);
        const message = err instanceof Error ? err.message : 'Transaction failed';
        toast.error(message || 'An error occurred while submitting your transaction. Please try again.');
      }
    },
    [processOrder]
  );

  const handleValidationError = useCallback(() => {
    toast.error('Please fill out all fields correctly before submitting.');
  }, []);

  return (
    <div css={$.container}>
      <IncreasePositionForm.OptionsProvider>
        <IncreasePositionForm.KernelProvider
          onSubmitSuccessful={handleOrderSubmission}
          onSubmitFailure={handleValidationError}
          defaultOrderSide={defaultOrderSide}
          {...(!isWalletConnected && { resolver: null })}
        >
          {!hideSideSwitch && <IncreasePositionForm.OrderSideSwitch />}
          <IncreasePositionForm.PositionSizeInputs />
          <IncreasePositionForm.LeverageInput />
          {isWalletConnected ? (
            <IncreasePositionForm.SubmitPositionButton />
          ) : (
            <Button size="3" onClick={wallet.establishConnection} css={$.connectWalletButton}>
              Connect Wallet
            </Button>
          )}
        </IncreasePositionForm.KernelProvider>
      </IncreasePositionForm.OptionsProvider>
    </div>
  );
};

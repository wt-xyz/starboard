import { type FC, useCallback, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { CollateralAmount, DecimalValue, type RequestStatus } from 'fuel-ts-sdk';
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

  const [transactionStatus, setTransactionStatus] = useState<RequestStatus>('uninitialized');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState(false);

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
      setTransactionStatus('pending');
      setErrorMessage('');

      try {
        await processOrder(formData);
        setTransactionStatus('fulfilled');
      } catch (err) {
        setTransactionStatus('rejected');
        setErrorMessage(err instanceof Error ? err.message : 'Transaction failed');
      }
    },
    [processOrder]
  );

  const handleValidationError = useCallback(() => {
    setShowValidationError(true);
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

      <IncreasePositionForm.ValidationErrorDialog
        open={showValidationError}
        onOpenChange={(open: boolean) => !open && setShowValidationError(false)}
      />

      <IncreasePositionForm.ProcessingTransactionDialog open={transactionStatus === 'pending'} />

      <IncreasePositionForm.TransactionSuccessDialog
        open={transactionStatus === 'fulfilled'}
        onOpenChange={(open: boolean) => !open && setTransactionStatus('uninitialized')}
      />

      <IncreasePositionForm.TransactionErrorDialog
        open={transactionStatus === 'rejected'}
        onOpenChange={(open: boolean) => !open && setTransactionStatus('uninitialized')}
        description={
          errorMessage || 'An error occurred while submitting your transaction. Please try again.'
        }
      />
    </div>
  );
};

import { type FC, useCallback } from 'react';
import { Button, Dialog } from '@radix-ui/themes';
import { CollateralAmount, type PositionStableId } from 'fuel-ts-sdk';
import { toast } from 'react-toastify';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import { EditCollateralForm, type EditCollateralFormModel } from '@/pages/Dashboard/submodules';
import * as $ from './CollateralTab.css';
import { Summary } from './Summary';

export interface CollateralTabProps {
  positionId: PositionStableId;
  onSubmitSuccess?: () => void;
}

export const CollateralTab: FC<CollateralTabProps> = ({ positionId, onSubmitSuccess }) => {
  const tradingSdk = useTradingSdk();

  const handleSubmit = useCallback(
    async (formData: EditCollateralFormModel) => {
      const { action, amount } = formData;
      const collateralAmount = CollateralAmount.fromDecimalString(amount);

      try {
        if (action === 'deposit') {
          await tradingSdk.depositCollateral({ positionId, amount: collateralAmount });
        } else {
          await tradingSdk.withdrawCollateral({ positionId, amount: collateralAmount });
        }

        toast.success(
          `Collateral ${action === 'deposit' ? 'deposited' : 'withdrawn'} successfully`
        );
        onSubmitSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to ${action} collateral: ${message}`);
      }
    },
    [tradingSdk, positionId, onSubmitSuccess]
  );

  return (
    <div className={$.container}>
      <EditCollateralForm.FormProvider positionId={positionId} onSubmitFulfilled={handleSubmit}>
        <div className={$.actionSwitchSection}>
          <EditCollateralForm.ActionSwitch />
        </div>

        <div className={$.inputSection}>
          <EditCollateralForm.AmountInput />
        </div>

        <div className={$.summarySection}>
          <Summary positionId={positionId} />
        </div>

        <div className={$.actionsSection}>
          <Dialog.Close>
            <Button variant="outline" size="3" className={$.cancelButton}>
              Cancel
            </Button>
          </Dialog.Close>
          <EditCollateralForm.SubmitButton />
        </div>
      </EditCollateralForm.FormProvider>
    </div>
  );
};

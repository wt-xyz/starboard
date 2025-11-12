import { FC } from 'react';

import { DepositVaultFormProvider } from '../../contexts/DepositVaultForm.provider';
import { ValidationAlertMessages } from '../common/ValidationAlertMessages';
import { WithdrawAmountInput } from './components/WithdrawAmountInput';

export const WithdrawFundsForm: FC = () => {
  return (
    <DepositVaultFormProvider>
      <WithdrawAmountInput />
      <ValidationAlertMessages />
    </DepositVaultFormProvider>
  );
};

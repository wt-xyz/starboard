import { FC } from 'react';

import { DepositVaultFormProvider } from '../../contexts/DepositVaultForm.provider';
import { WithdrawAmountInput } from './components/WithdrawAmountInput';

export const WithdrawFundsForm: FC = () => {
  return (
    <DepositVaultFormProvider>
      <WithdrawAmountInput />
    </DepositVaultFormProvider>
  );
};

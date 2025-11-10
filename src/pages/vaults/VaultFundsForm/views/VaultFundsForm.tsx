import { memo, useState } from 'react';

import { DepositFundsForm } from '../components/DepositFundsForm';
import { OperationType, OperationTypeSwitch } from '../components/OperationTypeSwitch';
import { WithdrawFundsForm } from '../components/WithdrawFundsForm';
import $ from './VaultFundsForm.styles';

export const VaultFundsForms = memo(() => {
  const [operation, setOperation] = useState<OperationType>(OperationType.DEPOSIT);

  return (
    <$.RootStyle>
      <OperationTypeSwitch operationType={operation} onOperationTypeChange={setOperation} />

      <$.FormBox active={operation === OperationType.DEPOSIT}>
        <DepositFundsForm />
      </$.FormBox>
      <$.FormBox active={operation === OperationType.WITHDRAW}>
        <WithdrawFundsForm />
      </$.FormBox>
    </$.RootStyle>
  );
});

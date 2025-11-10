import { useState } from 'react';

import { OperationType, OperationTypeSwitch } from '../components/OperationTypeSwitch';
import $ from './VaultFundsForm.styles';

export const VaultFundsForms = () => {
  const [operation, setOperation] = useState<OperationType>(OperationType.DEPOSIT);

  return (
    <$.RootStyle>
      <OperationTypeSwitch operationType={operation} onOperationTypeChange={setOperation} />
    </$.RootStyle>
  );
};

import { FC } from 'react';

import { STRING_KEYS } from '@/constants/localization';

import { useLocaleGetter } from '@/hooks/useLocaleGetter';

import { DetailsItem } from '@/components/Details';

import { DepositVaultFormProvider } from '../contexts/DepositVaultForm.provider';
import { AmountInput } from './common/AmountInput';
import { FreeCollateralDiff } from './common/FreeCollateralDiff';
import { ValidationAlertMessages } from './common/ValidationAlertMessages';

const RawDepositFundsForm: FC = () => {
  const { getLocaleString } = useLocaleGetter();

  const inputReceiptItems: DetailsItem[] = [
    {
      key: 'cross-free-collateral',
      tooltip: 'cross-free-collateral',
      label: getLocaleString({ key: STRING_KEYS.CROSS_FREE_COLLATERAL }),
      value: <FreeCollateralDiff />,
    },
  ];

  return (
    <>
      <AmountInput
        disabled={false}
        label={getLocaleString({ key: STRING_KEYS.AMOUNT_TO_ADD })}
        maxAmount="0"
        receiptItems={inputReceiptItems}
      />
      <ValidationAlertMessages />
    </>
  );
};

export const DepositFundsForm = () => (
  <DepositVaultFormProvider>
    <RawDepositFundsForm />
  </DepositVaultFormProvider>
);

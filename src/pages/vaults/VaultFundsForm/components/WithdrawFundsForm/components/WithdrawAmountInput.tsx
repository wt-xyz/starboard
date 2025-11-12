import { FC } from 'react';

import BigNumber from 'bignumber.js';

import { STRING_KEYS } from '@/constants/localization';

import { useLocaleGetter } from '@/hooks/useLocaleGetter';
import { useLoadedVaultAccount } from '@/hooks/vaultsHooks';

import { DetailsItem } from '@/components/Details';
import { DiffOutput } from '@/components/DiffOutput';
import { OutputType } from '@/components/Output';

import { mapIfPresent } from '@/lib/do';
import { getNumberSign, MustBigNumber } from '@/lib/numbers';

import { useComputedVaultFormData } from '../../../hooks/useComputedVaultFormData';
import { useVaultFundsValidationResult } from '../../../hooks/useVaultFundsValidationResult';
import { AmountInput } from '../../common/AmountInput';

export const WithdrawAmountInput: FC = () => {
  const { getLocaleString } = useLocaleGetter();
  const { amount } = useComputedVaultFormData();
  const availableUserBalance = useLoadedVaultAccount().data?.withdrawableUsdc;
  const projectedUserBalance = useVaultFundsValidationResult().summaryData.withdrawableVaultBalance;

  const inputReceiptItems: DetailsItem[] = [
    {
      key: 'vault-balance',
      tooltip: 'vault-available-to-withdraw',
      label: getLocaleString({ key: STRING_KEYS.AVAILABLE_TO_REMOVE }),
      value: (
        <DiffOutput
          type={OutputType.Fiat}
          roundingMode={BigNumber.ROUND_FLOOR}
          value={availableUserBalance}
          newValue={projectedUserBalance}
          sign={mapIfPresent(
            projectedUserBalance,
            availableUserBalance ?? 0.0,
            (updated, cur) => updated - cur
          )?.pipe(getNumberSign)}
          withDiff={
            MustBigNumber(amount).gt(0) &&
            projectedUserBalance != null &&
            projectedUserBalance !== availableUserBalance
          }
        />
      ),
    },
  ];

  return (
    <AmountInput
      disabled={false}
      label={getLocaleString({ key: STRING_KEYS.AMOUNT_TO_REMOVE })}
      maxAmount={`${Math.floor(100 * (availableUserBalance ?? 0)) / 100}`}
      receiptItems={inputReceiptItems}
    />
  );
};

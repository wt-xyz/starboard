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
  const currentAvailableUserBalance = useLoadedVaultAccount().data?.withdrawableUsdc;
  const userAvailableBalance = useLoadedVaultAccount().data?.withdrawableUsdc;

  const projectedAvailableUserBalance =
    useVaultFundsValidationResult().summaryData.withdrawableVaultBalance;

  const inputReceiptItems: DetailsItem[] = [
    {
      key: 'vault-balance',
      tooltip: 'vault-available-to-withdraw',
      label: getLocaleString({ key: STRING_KEYS.AVAILABLE_TO_REMOVE }),
      value: (
        <DiffOutput
          type={OutputType.Fiat}
          roundingMode={BigNumber.ROUND_FLOOR}
          value={currentAvailableUserBalance}
          newValue={projectedAvailableUserBalance}
          sign={getNumberSign(
            mapIfPresent(
              projectedAvailableUserBalance,
              currentAvailableUserBalance ?? 0.0,
              (updated, cur) => updated - cur
            )
          )}
          withDiff={
            MustBigNumber(amount).gt(0) &&
            projectedAvailableUserBalance != null &&
            projectedAvailableUserBalance !== currentAvailableUserBalance
          }
        />
      ),
    },
  ];

  return (
    <AmountInput
      disabled={false}
      label={getLocaleString({ key: STRING_KEYS.AMOUNT_TO_REMOVE })}
      maxAmount={`${Math.floor(100 * (userAvailableBalance ?? 0)) / 100}`}
      receiptItems={inputReceiptItems}
    />
  );
};

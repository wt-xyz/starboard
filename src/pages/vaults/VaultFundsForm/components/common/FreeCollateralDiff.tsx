import { FC } from 'react';

import BigNumber from 'bignumber.js';

import { DiffOutput } from '@/components/DiffOutput';
import { OutputType } from '@/components/Output';

import { getSubaccount } from '@/state/accountSelectors';
import { useAppSelector } from '@/state/appTypes';

import { mapIfPresent } from '@/lib/do';
import { getNumberSign, MustBigNumber } from '@/lib/numbers';

import { useComputedVaultFormData } from '../../hooks/useComputedVaultFormData';
import { useVaultFundsValidationResult } from '../../hooks/useVaultFundsValidationResult';

export const FreeCollateralDiff: FC = () => {
  const formData = useComputedVaultFormData();

  const currentFreeCollateral = useAppSelector(getSubaccount)?.freeCollateral.toNumber();
  const projectedFreeCollateral = useVaultFundsValidationResult().summaryData.freeCollateral;

  return (
    <DiffOutput
      type={OutputType.Fiat}
      roundingMode={BigNumber.ROUND_FLOOR}
      value={currentFreeCollateral}
      newValue={projectedFreeCollateral}
      sign={getNumberSign(
        mapIfPresent(
          projectedFreeCollateral,
          currentFreeCollateral,
          (updated, cur) => updated - cur
        )
      )}
      withDiff={
        MustBigNumber(formData.amount).gt(0) &&
        projectedFreeCollateral != null &&
        currentFreeCollateral !== projectedFreeCollateral
      }
    />
  );
};

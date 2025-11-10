import { FC, ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';

import { VaultFundsFormType } from '../models/VaultFundsFormModel';
import {
  withdrawVaultFundsFormDefaultValues,
  withdrawVaultFundsFormSchema,
  WithdrawVaultFundsFormType,
} from '../models/WithdrawVaultFundsFormModel';
import { VaultFormContext } from './VaultForm.context';

type WithdrawVaultFormProviderProps = {
  children: ReactNode;
};

export const WithdrawVaultFormProvider: FC<WithdrawVaultFormProviderProps> = ({ children }) => {
  const form = useForm<WithdrawVaultFundsFormType>({
    resolver: zodResolver(withdrawVaultFundsFormSchema),
    defaultValues: withdrawVaultFundsFormDefaultValues,
  });

  return (
    <VaultFormContext.Provider value={form as UseFormReturn<VaultFundsFormType>}>
      {children}
    </VaultFormContext.Provider>
  );
};

import { FC, ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';

import {
  depositVaultFundsFormDefaultValues,
  depositVaultFundsFormSchema,
  DepositVaultFundsFormType,
} from '../models/DepositVaultFundsFormModel';
import { VaultFundsFormType } from '../models/VaultFundsFormModel';
import { VaultFormContext } from './VaultForm.context';

type DepositVaultFormProviderProps = {
  children: ReactNode;
};

export const DepositVaultFormProvider: FC<DepositVaultFormProviderProps> = ({ children }) => {
  const form = useForm<DepositVaultFundsFormType>({
    resolver: zodResolver(depositVaultFundsFormSchema),
    defaultValues: depositVaultFundsFormDefaultValues,
  });

  return (
    <VaultFormContext.Provider value={form as UseFormReturn<VaultFundsFormType>}>
      {children}
    </VaultFormContext.Provider>
  );
};

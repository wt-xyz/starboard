import { createContext } from 'react';

import { UseFormReturn } from 'react-hook-form';

import { VaultFundsFormType } from '../models/VaultFundsFormModel';

export type VaultFormContextType = Pick<UseFormReturn<VaultFundsFormType>, 'control'>;

export const VaultFormContext = createContext<VaultFormContextType | null>(null);
VaultFormContext.displayName = 'VaultFormContext';

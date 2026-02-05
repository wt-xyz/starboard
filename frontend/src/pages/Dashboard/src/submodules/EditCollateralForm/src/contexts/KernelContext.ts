import { createContext } from 'react';
import type { Control } from 'react-hook-form';
import type { Promiseable } from '@/types/Promiseable';
import type { EditCollateralFormModel } from '../models';

export type KernelContextType = {
  control: Control<EditCollateralFormModel>;
  submit: () => Promiseable<void>;
};

export const KernelContext = createContext<KernelContextType | null>(null);

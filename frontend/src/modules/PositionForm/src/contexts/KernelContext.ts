import { createContext } from 'react';
import type { Control } from 'react-hook-form';
import type { Promiseable } from '@/types/Promiseable';
import type { PositionFormModel } from '../models';

export type KernelContextType<T extends Partial<PositionFormModel> = Partial<PositionFormModel>> = {
  control: Control<T>;
  submit: () => Promiseable<void>;
};

export const KernelContext = createContext<KernelContextType | null>(null);

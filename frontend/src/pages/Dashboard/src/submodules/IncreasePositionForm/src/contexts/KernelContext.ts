import type { Context } from 'react';
import * as PositionForm from '@/modules/PositionForm';
import type { IncreasePositionFormModel } from '../models';

export type KernelContextType = PositionForm.KernelContextType<IncreasePositionFormModel>;

export const KernelContext = PositionForm.KernelContext as Context<KernelContextType | null>;

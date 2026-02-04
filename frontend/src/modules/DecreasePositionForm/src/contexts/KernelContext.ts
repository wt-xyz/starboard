import type { Context } from 'react';
import * as PositionForm from '@/modules/PositionForm';
import type { DecreasePositionFormModel } from '../models';

export type KernelContextType = PositionForm.KernelContextType<DecreasePositionFormModel>;

export const KernelContext = PositionForm.KernelContext as Context<KernelContextType | null>;

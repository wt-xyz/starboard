import type { Context } from 'react';
import * as PositionForm from '@/modules/PositionForm';
import type { EditCollateralFormModel } from '../models';

export type KernelContextType = PositionForm.KernelContextType<EditCollateralFormModel>;

export const KernelContext = PositionForm.KernelContext as Context<KernelContextType | null>;

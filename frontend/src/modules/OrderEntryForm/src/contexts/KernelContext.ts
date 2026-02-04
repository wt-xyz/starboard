import type { Context } from 'react';
import * as PositionForm from '@/modules/PositionForm';
import type { OrderEntryFormModel } from '../models';

export type KernelContextType = PositionForm.KernelContextType<OrderEntryFormModel>;

export const KernelContext = PositionForm.KernelContext as Context<KernelContextType | null>;

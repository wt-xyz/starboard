import type z from 'zod';
import { PositionFormSchema, parseDecimal } from '@/modules/PositionForm';

export const DecreasePositionFormSchema = PositionFormSchema.pick({
  sizeDelta: true,
  totalSize: true,
  leverage: true,
}).refine((data) => parseDecimal(data.sizeDelta) <= parseDecimal(data.totalSize), {
  message: 'Decrease amount cannot exceed total size',
  path: ['sizeDelta'],
});

export type DecreasePositionFormModel = z.infer<typeof DecreasePositionFormSchema>;

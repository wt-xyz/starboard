import z from 'zod';
import { collateralField, parseDecimal } from '@/modules/PositionForm';

export const COLLATERAL_ACTIONS = ['deposit', 'withdraw'] as const;
export type CollateralAction = (typeof COLLATERAL_ACTIONS)[number];

export const EditCollateralFormSchema = z
  .object({
    action: z.enum(COLLATERAL_ACTIONS),
    amount: collateralField,
    maxAmount: z.number(),
  })
  .refine((data) => parseDecimal(data.amount) <= data.maxAmount, {
    message: 'Amount exceeds available balance',
    path: ['amount'],
  });

export type EditCollateralFormModel = z.infer<typeof EditCollateralFormSchema>;

export const nullEditCollateralForm: Omit<EditCollateralFormModel, 'maxAmount'> = {
  action: 'deposit',
  amount: '',
};

import z from 'zod';

const numericString = z.string().regex(/^\d*\.?\d*$/, 'Must be a valid number');

export const ORDER_SIDES = ['long', 'short'] as const;
export type OrderSide = (typeof ORDER_SIDES)[number];

export const PositionFormSchema = z.object({
  orderSide: z.enum(ORDER_SIDES),

  leverage: numericString.min(1, 'Leverage is required').superRefine((val, ctx) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Leverage must be greater than 0' });
      return;
    }
    if (num < 0.1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Leverage must be at least 0.1x' });
    }
    if (num > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Leverage cannot exceed 100x' });
    }
  }),

  positionSize: numericString
    .min(1, 'Position size is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Position size must be greater than 0',
    }),

  collateralSize: numericString
    .min(1, 'Collateral is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Collateral must be greater than 0',
    }),

  sizeDelta: numericString.refine(
    (val) => val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: 'Must be a positive number' }
  ),

  totalSize: z.string(),
});

export type PositionFormModel = z.infer<typeof PositionFormSchema>;

export type PositionFormField = keyof PositionFormModel;

export const orderSide = PositionFormSchema.shape.orderSide;
export const leverageField = PositionFormSchema.shape.leverage;
export const positionSizeField = PositionFormSchema.shape.positionSize;
export const collateralField = PositionFormSchema.shape.collateralSize;
export const sizeDeltaField = PositionFormSchema.shape.sizeDelta;

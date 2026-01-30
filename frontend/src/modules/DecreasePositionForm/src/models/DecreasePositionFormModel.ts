import z from 'zod';

export interface DecreasePositionFormModel {
  totalSizeNumeric: string;
  sizeDeltaNumeric: string;
}

const positiveNumericString = z
  .string()
  .refine((val) => val !== '' && !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Must be a positive number',
  });

export const DecreasePositionFormSchema = z
  .object({
    totalSizeNumeric: z.string(),
    sizeDeltaNumeric: positiveNumericString,
  })
  .refine((data) => Number(data.sizeDeltaNumeric) <= Number(data.totalSizeNumeric), {
    message: 'Decrease amount cannot exceed total size',
  }) satisfies z.ZodType<DecreasePositionFormModel>;

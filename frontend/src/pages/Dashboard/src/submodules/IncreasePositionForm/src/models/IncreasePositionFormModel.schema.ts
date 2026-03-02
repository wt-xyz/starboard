import z from 'zod';
import * as PositionForm from '@/modules/PositionForm';
import { PositionFormSchema } from '@/modules/PositionForm';

export const createIncreasePositionFormSchema = (options: PositionForm.OptionsContextType) => {
  return BaseIncreasePositionFormSchema.superRefine(function validateMarketMaxLeverage(data, ctx) {
    if (!options.maxLeverage) return;

    const leverage = PositionForm.parseDecimal(data.leverage);
    if (leverage === 0) return;

    if (leverage > options.maxLeverage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['leverage'],
        message: `Maximum leverage for this market is ${options.maxLeverage}x`,
      });
    }
  })
    .superRefine(function validateInitialMarginFraction(data, ctx) {
      if (!options.initialMarginFraction) return;

      const leverage = PositionForm.parseDecimal(data.leverage);
      if (leverage === 0) return;

      const maxAllowedLeverage = 1 / options.initialMarginFraction;

      if (leverage > maxAllowedLeverage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['leverage'],
          message: `Leverage cannot exceed ${maxAllowedLeverage.toFixed(1)}x based on margin requirements`,
        });
      }
    })
    .superRefine(function validateUserBalance(data, ctx) {
      if (options.userBalanceInBaseAsset == null) return;

      const collateral = PositionForm.parseDecimal(data.collateralSize);
      if (collateral === 0) return;

      if (collateral > options.userBalanceInBaseAsset) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['collateralSize'],
          message: 'Insufficient balance',
        });
      }
    })
    .superRefine(function validateMinCollateral(data, ctx) {
      if (!options.minCollateral) return;

      const collateral = PositionForm.parseDecimal(data.collateralSize);
      if (collateral === 0) return;

      if (collateral < options.minCollateral) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['collateralSize'],
          message: `Minimum collateral is ${options.minCollateral}`,
        });
      }
    })
    .superRefine(function validateMinPositionSize(data, ctx) {
      if (!options.minPositionSize) return;

      const position = PositionForm.parseDecimal(data.positionSize);
      if (position === 0) return;

      if (position < options.minPositionSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['positionSize'],
          message:
            `Minimum position size is ${options.minPositionSize} ${options.quoteAssetSymbol ?? ''}`.trim(),
        });
      }
    })
    .superRefine(function validateMaxPositionSize(data, ctx) {
      if (!options.maxPositionSize) return;

      const position = PositionForm.parseDecimal(data.positionSize);
      if (position === 0) return;

      if (position > options.maxPositionSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['positionSize'],
          message:
            `Maximum position size is ${options.maxPositionSize} ${options.quoteAssetSymbol ?? ''}`.trim(),
        });
      }
    });
};

const BaseIncreasePositionFormSchema = PositionFormSchema.pick({
  orderSide: true,
  leverage: true,
  positionSize: true,
  collateralSize: true,
});

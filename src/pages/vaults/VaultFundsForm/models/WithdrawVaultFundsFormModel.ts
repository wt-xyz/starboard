import { VaultFormAction, VaultFormData } from '@/bonsai/public-calculators/vaultFormValidation';
import z from 'zod';

export const withdrawVaultFundsFormSchema = z.object({
  action: z.literal(VaultFormAction.WITHDRAW),
  amountInUsdString: z.string(),
  isSlippageAcknowledged: z.boolean(),
  isConfirmationStep: z.boolean(),
});

export type WithdrawVaultFundsFormType = z.infer<typeof withdrawVaultFundsFormSchema>;

export const withdrawVaultFundsFormDefaultValues: WithdrawVaultFundsFormType = {
  action: VaultFormAction.WITHDRAW,
  amountInUsdString: '',
  isConfirmationStep: false,
  isSlippageAcknowledged: false,
};

export function toWithdrawVaultFormData(formData: WithdrawVaultFundsFormType): VaultFormData {
  const amountNumeric = z.number().parse(formData.amountInUsdString);

  return {
    acknowledgedSlippage: formData.isSlippageAcknowledged,
    acknowledgedTerms: false,
    action: VaultFormAction.WITHDRAW,
    inConfirmationStep: formData.isConfirmationStep,
    amount: amountNumeric,
  };
}

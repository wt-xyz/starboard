import { VaultFormAction, VaultFormData } from '@/bonsai/public-calculators/vaultFormValidation';
import z from 'zod';

export const depositVaultFundsFormSchema = z.object({
  action: z.literal(VaultFormAction.DEPOSIT),
  amountInUsdString: z.string(),
  areTermsAcknowledged: z.boolean(),
  isConfirmationStep: z.boolean(),
});

export type DepositVaultFundsFormType = z.infer<typeof depositVaultFundsFormSchema>;

export const depositVaultFundsFormDefaultValues: DepositVaultFundsFormType = {
  action: VaultFormAction.DEPOSIT,
  amountInUsdString: '',
  isConfirmationStep: false,
  areTermsAcknowledged: false,
};

export function toDepositVaultFormData(formData: DepositVaultFundsFormType): VaultFormData {
  const amountNumeric = z.coerce.number().parse(formData.amountInUsdString);

  return {
    acknowledgedSlippage: false,
    acknowledgedTerms: formData.areTermsAcknowledged,
    action: VaultFormAction.DEPOSIT,
    inConfirmationStep: formData.isConfirmationStep,
    amount: amountNumeric,
  };
}

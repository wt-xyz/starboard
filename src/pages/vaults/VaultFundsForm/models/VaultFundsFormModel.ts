import { VaultFormAction, VaultFormData } from '@/bonsai/public-calculators/vaultFormValidation';
import z from 'zod';

import { depositVaultFundsFormSchema, toDepositVaultFormData } from './DepositVaultFundsFormModel';
import {
  toWithdrawVaultFormData,
  withdrawVaultFundsFormSchema,
} from './WithdrawVaultFundsFormModel';

export const vaultFundsFormSchema = z.discriminatedUnion('action', [
  depositVaultFundsFormSchema,
  withdrawVaultFundsFormSchema,
]);

export type VaultFundsFormType = z.infer<typeof vaultFundsFormSchema>;

export function toVaultFormData(form: VaultFundsFormType): VaultFormData {
  if (form.action === VaultFormAction.DEPOSIT) return toDepositVaultFormData(form);
  return toWithdrawVaultFormData(form);
}

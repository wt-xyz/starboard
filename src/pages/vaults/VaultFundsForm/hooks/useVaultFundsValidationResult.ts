import { validateVaultForm } from '@/bonsai/public-calculators/vaultFormValidation';

import { useComputedVaultFormData } from './useComputedVaultFormData';

export function useVaultFundsValidationResult() {
  const vaultFormData = useComputedVaultFormData();

  // TODO: Make sure that it is properly invoked, vaultHooks.ts ln 310
  return validateVaultForm(vaultFormData);
}

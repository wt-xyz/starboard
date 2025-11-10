import { VaultFormData } from '@/bonsai/public-calculators/vaultFormValidation';
import { useWatch } from 'react-hook-form';

import { useRequiredContext } from '@/hooks/useRequiredContext';

import { VaultFormContext } from '../contexts/VaultForm.context';
import { toVaultFormData } from '../models/VaultFundsFormModel';

export function useComputedVaultFormData(): VaultFormData {
  const { control } = useRequiredContext(VaultFormContext);
  return useWatch({ control, compute: toVaultFormData });
}

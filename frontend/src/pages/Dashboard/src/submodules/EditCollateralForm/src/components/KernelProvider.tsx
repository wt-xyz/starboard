import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldErrors, useForm, useWatch } from 'react-hook-form';
import type { Promiseable } from '@/types/Promiseable';
import { KernelContext, type KernelContextType } from '../contexts';
import {
  type EditCollateralFormModel,
  EditCollateralFormSchema,
  nullEditCollateralForm,
} from '../models';

export interface KernelProviderProps {
  children: ReactNode;
  depositMax: number;
  withdrawMax: number;
  onSubmitFulfilled: (data: EditCollateralFormModel) => Promiseable<void>;
  onSubmitRejected?: (errors: FieldErrors<EditCollateralFormModel>) => void;
}

export const KernelProvider: FC<KernelProviderProps> = ({
  children,
  depositMax,
  withdrawMax,
  onSubmitFulfilled,
  onSubmitRejected,
}) => {
  const { control, handleSubmit, setValue } = useForm<EditCollateralFormModel>({
    resolver: zodResolver(EditCollateralFormSchema),
    defaultValues: { ...nullEditCollateralForm, maxAmount: depositMax },
    mode: 'onSubmit',
  });

  const action = useWatch({ control, name: 'action' });

  useEffect(() => {
    const newMax = action === 'deposit' ? depositMax : withdrawMax;
    setValue('maxAmount', newMax);
  }, [action, depositMax, withdrawMax, setValue]);

  const submit = useCallback(
    () => handleSubmit((data) => onSubmitFulfilled(data), onSubmitRejected)(),
    [handleSubmit, onSubmitFulfilled, onSubmitRejected]
  );

  const contextValue = useMemo<KernelContextType>(() => ({ control, submit }), [control, submit]);

  return <KernelContext.Provider value={contextValue}>{children}</KernelContext.Provider>;
};

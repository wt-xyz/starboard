import type { FC, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldErrors, useForm } from 'react-hook-form';
import type { Promiseable } from '@/types/Promiseable';
import { KernelContext, type KernelContextType } from '../contexts';
import { type DecreasePositionFormModel, DecreasePositionFormSchema } from '../models';

export interface KernelProviderProps {
  totalSize: string;
  leverage: string;
  onSubmitFulfilled: (data: DecreasePositionFormModel) => Promiseable<void>;
  onSubmitRejected?: (errors: FieldErrors<DecreasePositionFormModel>) => void;
  children: ReactNode;
}

export const KernelProvider: FC<KernelProviderProps> = ({
  children,
  totalSize,
  leverage,
  onSubmitFulfilled,
  onSubmitRejected,
}) => {
  const { control, handleSubmit } = useForm<DecreasePositionFormModel>({
    resolver: zodResolver(DecreasePositionFormSchema),
    defaultValues: {
      totalSize,
      leverage,
      sizeDelta: '',
    },
    mode: 'onChange',
  });

  const submit = useCallback(
    () => handleSubmit((data) => onSubmitFulfilled(data), onSubmitRejected)(),
    [handleSubmit, onSubmitFulfilled, onSubmitRejected]
  );

  const contextValue = useMemo<KernelContextType>(() => ({ control, submit }), [control, submit]);

  return <KernelContext.Provider value={contextValue}>{children}</KernelContext.Provider>;
};

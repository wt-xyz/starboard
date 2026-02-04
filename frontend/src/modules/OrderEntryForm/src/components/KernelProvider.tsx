import { type FC, type ReactNode, use, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Resolver, type SubmitErrorHandler, useForm } from 'react-hook-form';
import { KernelContext, type KernelContextType, OptionsContext } from '../contexts';
import type { OrderEntryFormModel } from '../models';
import { createOrderEntryFormSchema, nullOrderEntryForm } from '../models';

export type KernelProviderProps = {
  children: ReactNode;
  onSubmitSuccessful: (data: OrderEntryFormModel) => void;
  onSubmitFailure?: SubmitErrorHandler<OrderEntryFormModel>;
  resolver?: Resolver<OrderEntryFormModel> | null;
};

export const KernelProvider: FC<KernelProviderProps> = ({
  children,
  onSubmitSuccessful,
  onSubmitFailure,
  resolver,
}) => {
  const options = use(OptionsContext)!;

  const form = useForm<OrderEntryFormModel>({
    defaultValues: nullOrderEntryForm,
    mode: 'all',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    resolver: (() => {
      if (resolver === null) return undefined;
      if (resolver) return resolver;
      return zodResolver(createOrderEntryFormSchema(options));
    })(),
  });

  const contextValue = useMemo<KernelContextType>(
    () => ({
      control: form.control,
      submit: form.handleSubmit(onSubmitSuccessful, onSubmitFailure),
    }),
    [form, onSubmitFailure, onSubmitSuccessful]
  );

  return <KernelContext.Provider value={contextValue}>{children}</KernelContext.Provider>;
};

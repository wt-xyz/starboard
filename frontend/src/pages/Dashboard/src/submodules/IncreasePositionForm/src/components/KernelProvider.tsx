import { type FC, type ReactNode, use, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Resolver, type SubmitErrorHandler, useForm } from 'react-hook-form';
import { KernelContext, type KernelContextType, OptionsContext } from '../contexts';
import type { IncreasePositionFormModel, OrderSide } from '../models';
import { createIncreasePositionFormSchema, nullIncreasePositionForm } from '../models';

export type KernelProviderProps = {
  children: ReactNode;
  onSubmitSuccessful: (data: IncreasePositionFormModel) => void;
  onSubmitFailure?: SubmitErrorHandler<IncreasePositionFormModel>;
  resolver?: Resolver<IncreasePositionFormModel> | null;
  defaultOrderSide?: OrderSide;
};

export const KernelProvider: FC<KernelProviderProps> = ({
  children,
  onSubmitSuccessful,
  onSubmitFailure,
  resolver,
  defaultOrderSide,
}) => {
  const options = use(OptionsContext)!;

  const form = useForm<IncreasePositionFormModel>({
    defaultValues: {
      ...nullIncreasePositionForm,
      ...(defaultOrderSide && { orderSide: defaultOrderSide }),
    },
    mode: 'all',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    resolver: (() => {
      if (resolver === null) return undefined;
      if (resolver) return resolver;
      return zodResolver(createIncreasePositionFormSchema(options));
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

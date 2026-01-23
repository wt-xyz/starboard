import type { FC, ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitErrorHandler, useForm } from 'react-hook-form';
import { useRequiredContext } from '@/lib/useRequiredContext';
import type { OrderEntryFormModel, OrderSide } from '../models';
import { createOrderEntryFormSchema, nullOrderEntryForm } from '../models';
import {
  OrderEntryFormApiContext,
  type OrderEntryFormApiContextType,
} from './OrderEntryFormApiContext';
import { OrderEntryFormMetaContext } from './OrderEntryFormMetaContext';

export type OrderEntryFormApiContextProviderProps = {
  children: ReactNode;
  onSubmitSuccessful: (data: OrderEntryFormModel) => void;
  onSubmitFailure?: SubmitErrorHandler<OrderEntryFormModel>;
  skipValidation?: boolean;
  defaultOrderSide?: OrderSide;
};

export const OrderEntryFormApiContextProvider: FC<OrderEntryFormApiContextProviderProps> = ({
  children,
  onSubmitSuccessful,
  onSubmitFailure,
  skipValidation,
  defaultOrderSide = 'long',
}) => {
  const meta = useRequiredContext(OrderEntryFormMetaContext);

  const form = useForm<OrderEntryFormModel>({
    defaultValues: {
      ...nullOrderEntryForm,
      orderSide: defaultOrderSide,
    },
    mode: 'all',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    ...(!skipValidation && {
      resolver: zodResolver(createOrderEntryFormSchema(meta)),
    }),
  });

  // Reset form when defaultOrderSide changes
  useEffect(() => {
    form.reset({
      ...nullOrderEntryForm,
      orderSide: defaultOrderSide,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultOrderSide]);

  const contextValue = useMemo<OrderEntryFormApiContextType>(
    () => ({
      submitHandler: form.handleSubmit(onSubmitSuccessful, onSubmitFailure),
      control: form.control,
    }),
    [form, onSubmitFailure, onSubmitSuccessful]
  );

  return (
    <OrderEntryFormApiContext.Provider value={contextValue}>
      {children}
    </OrderEntryFormApiContext.Provider>
  );
};

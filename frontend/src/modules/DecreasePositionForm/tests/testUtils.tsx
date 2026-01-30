import type { FC, ReactNode } from 'react';
import { FormContextProvider, type FormContextProviderProps } from '../src/contexts/FormContext.Provider';
import { MetaContext, type MetaContextType } from '../src/contexts/MetaContext';

export interface TestWrapperProps {
  formProps: Omit<FormContextProviderProps, 'children'>;
  meta?: Partial<MetaContextType>;
  children: ReactNode;
}

export const TestWrapper: FC<TestWrapperProps> = ({
  formProps,
  meta = {},
  children,
}) => {
  const metaValue: MetaContextType = {
    baseAssetSymbol: meta.baseAssetSymbol ?? 'BTC',
    quoteAssetSymbol: meta.quoteAssetSymbol ?? 'USDC',
  };

  return (
    <MetaContext.Provider value={metaValue}>
      <FormContextProvider {...formProps}>{children}</FormContextProvider>
    </MetaContext.Provider>
  );
};

export const defaultFormProps: Omit<FormContextProviderProps, 'children' | 'onSubmit'> = {
  totalSize: '1000',
};

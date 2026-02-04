import type { FC, ReactNode } from 'react';
import * as DecreasePositionForm from '@/modules/DecreasePositionForm';

export interface TestWrapperProps {
  formProps: Omit<DecreasePositionForm.KernelProviderProps, 'children'>;
  options?: Partial<DecreasePositionForm.OptionsContextType>;
  children: ReactNode;
}

export const TestWrapper: FC<TestWrapperProps> = ({ formProps, options = {}, children }) => {
  const optionsValue: DecreasePositionForm.OptionsContextType = {
    baseAssetSymbol: options.baseAssetSymbol ?? 'BTC',
    quoteAssetSymbol: options.quoteAssetSymbol ?? 'USDC',
  };

  return (
    <DecreasePositionForm.OptionsContext.Provider value={optionsValue}>
      <DecreasePositionForm.KernelProvider {...formProps}>
        {children}
      </DecreasePositionForm.KernelProvider>
    </DecreasePositionForm.OptionsContext.Provider>
  );
};

export const defaultFormProps: Omit<DecreasePositionForm.KernelProviderProps, 'children'> = {
  totalSize: '1000',
  leverage: '1',
  onSubmitFulfilled: () => {},
};

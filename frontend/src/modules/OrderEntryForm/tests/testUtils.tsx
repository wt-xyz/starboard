import type { ReactNode } from 'react';
import { signal } from '@preact/signals-react';
import * as OrderEntryForm from '@/modules/OrderEntryForm';

const defaultMockContext: OrderEntryForm.OptionsContextType = {
  quoteAssetSymbol: 'USD',
  userBalanceInBaseAsset: 0.5,
  currentQuoteAssetPrice: signal(50000),
  currentBaseAssetPrice: signal(50000),
};

export function OrderEntryFormTestWrapper({
  children,
  context = defaultMockContext,
  onSubmitSuccessful = () => {},
  onSubmitFailure = () => {},
}: {
  children: ReactNode;
  context?: OrderEntryForm.OptionsContextType;
  onSubmitSuccessful?: (data: any) => void;
  onSubmitFailure?: (errors: any) => void;
}) {
  return (
    <OrderEntryForm.OptionsContext.Provider value={context}>
      <OrderEntryForm.KernelProvider
        onSubmitSuccessful={onSubmitSuccessful}
        onSubmitFailure={onSubmitFailure}
      >
        {children}
      </OrderEntryForm.KernelProvider>
    </OrderEntryForm.OptionsContext.Provider>
  );
}

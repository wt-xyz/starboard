import type { ReactNode } from 'react';
import type { FieldErrors } from 'react-hook-form';
import type { OrderEntryFormMetaContextType } from '../src/contexts';
import type { OrderEntryFormModel } from '../src/models/order-entry-form.model';
import { OrderEntryFormApiContextProvider, OrderEntryFormMetaContext } from '../src/contexts';

const defaultMockContext: OrderEntryFormMetaContextType = {
  baseAssetName: 'BTC',
  quoteAssetName: 'USD',
  userBalanceInQuoteAsset: 10000,
  userBalanceInBaseAsset: 0.5,
  currentQuoteAssetPrice: 50000,
};

export function OrderEntryFormTestWrapper({
  children,
  context = defaultMockContext,
  onSubmitSuccessful = () => {},
  onSubmitFailure = () => {},
}: {
  children: ReactNode;
  context?: OrderEntryFormMetaContextType;
  onSubmitSuccessful?: (data: OrderEntryFormModel) => void;
  onSubmitFailure?: (errors: FieldErrors<OrderEntryFormModel>) => void;
}) {
  return (
    <OrderEntryFormMetaContext.Provider value={context}>
      <OrderEntryFormApiContextProvider
        onSubmitSuccessful={onSubmitSuccessful}
        onSubmitFailure={onSubmitFailure}
      >
        {children}
      </OrderEntryFormApiContextProvider>
    </OrderEntryFormMetaContext.Provider>
  );
}

import { createContext } from 'react';

export interface MetaContextType {
  baseAssetSymbol: string;
  quoteAssetSymbol: string;
}

export const MetaContext = createContext<MetaContextType>({
  baseAssetSymbol: '',
  quoteAssetSymbol: '',
});
MetaContext.displayName = 'MetaContext';

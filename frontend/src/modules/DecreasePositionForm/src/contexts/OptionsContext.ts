import type { Context } from 'react';
import * as PositionForm from '@/modules/PositionForm';
import type { RequireFields } from '@/types/RequireFields';

export type OptionsContextType = RequireFields<
  PositionForm.OptionsContextType,
  'baseAssetSymbol' | 'quoteAssetSymbol'
>;

export const OptionsContext = PositionForm.OptionsContext as Context<OptionsContextType>;

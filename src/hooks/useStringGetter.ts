import type { StringGetterFunction } from '@/constants/localization';

import { useAppSelector } from '@/state/appTypes';
import { getLocaleStringGetter } from '@/state/localizationSelectors';

/**
 * @deprecated Use useLocaleGetter instead
 * @see {@link useLocaleGetter} for the replacement hook
 */
export const useStringGetter = (): StringGetterFunction => {
  const stringGetterFunction = useAppSelector(getLocaleStringGetter);
  return stringGetterFunction;
};

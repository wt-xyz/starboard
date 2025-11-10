import { useCallback, useMemo } from 'react';

import { StringGetterProps } from '@/constants/localization';

import { useAppStore } from '@/state/appTypes';
import { getStringForLocaleDate } from '@/state/localizationSelectors';

/**
 * Custom hook for accessing locale-specific date formatting
 *
 * Provides a memoized getter function that retrieves localized date strings
 * based on the current application locale state.
 *
 * @returns Object containing the getLocale function
 *
 * @example
 * ```tsx
 * const { getLocale } = useLocaleGetter();
 * const formattedDate = getLocale({ key: 'date.format', params: { date: new Date() } });
 * ```
 */
export function useLocaleGetter() {
  const store = useAppStore();

  /**
   * Retrieves a localized date string based on the provided properties
   *
   * @param props - Configuration object for the string getter
   * @returns The localized date string for the current locale
   */
  const getLocale = useCallback(
    (props: StringGetterProps) => {
      return getStringForLocaleDate(store.getState(), props);
    },
    [store]
  );

  const getLocaleString = useCallback(
    (props: StringGetterProps) => {
      const locale = getStringForLocaleDate(store.getState(), props);
      if (!(typeof locale === 'string')) return `<LOCALE TYPE FOR "${props.key}" IS NOT STRING>`;
      return locale;
    },
    [store]
  );

  return useMemo(
    () => ({
      getLocale,
      getLocaleString,
    }),
    [getLocale, getLocaleString]
  );
}

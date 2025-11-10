import { useCallback, useMemo } from 'react';

import { get } from 'lodash';

import { StringGetterProps } from '@/constants/localization';

import { useAppSelector, useAppStore } from '@/state/appTypes';
import { getEnLocaleData, getSelectedLocaleData } from '@/state/localizationSelectors';

import formatString from '@/lib/formatString';

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
  const localeData = useAppSelector(getSelectedLocaleData);

  const getLocale = useCallback(
    (params: StringGetterProps) => {
      const localeString = get(localeData, params.key);
      if (localeString) return formatString(localeString, params.params);

      const enString = get(getEnLocaleData(store.getState()), params.key);
      if (enString) return formatString(enString, params.params);

      return params.fallback ? formatString(params.fallback, params.params) : '';
    },
    [localeData, store]
  );

  const getLocaleString = useCallback(
    (props: StringGetterProps) => {
      const locale = getLocale(props);
      if (!(typeof locale === 'string')) return `<LOCALE TYPE FOR "${props.key}" IS NOT STRING>`;
      return locale;
    },
    [getLocale]
  );

  return useMemo(
    () => ({
      getLocale,
      getLocaleString,
    }),
    [getLocale, getLocaleString]
  );
}

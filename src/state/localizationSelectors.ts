import { get } from 'lodash';
import { createSelector } from 'reselect';

import {
  LocaleData,
  StringGetterFunction,
  StringGetterProps,
  SupportedLocales,
} from '@/constants/localization';

import formatString from '@/lib/formatString';

import { type RootState } from './_store';
import { createAppSelector } from './appTypes';

/**
 * @param state
 * @returns
 */
export const getIsLocaleLoaded = (state: RootState): boolean => state.localization.isLocaleLoaded;

/**
 * @param state
 * @returns
 */
export const getSelectedLocaleData = (state: RootState): LocaleData | undefined =>
  state.localization.localeData;

export const getEnLocaleData = (state: RootState): LocaleData | undefined =>
  state.localization.enLocaleData;

/**
 * @param state
 * @returns
 */
export const getSelectedLocale = (state: RootState): SupportedLocales =>
  state.localization.selectedLocale;

/**
 * @param state
 * @returns
 */
export const getStringGetterForLocaleData = (
  localeData: LocaleData | undefined,
  enLocaleData: LocaleData | undefined,
  isLocaleLoaded: boolean
): StringGetterFunction => {
  // @ts-expect-error TODO: formatString return doesn't match StringGetterFunction
  return (props) => {
    if (isLocaleLoaded) {
      let formattedString = props.fallback ?? '';

      if (localeData != null || enLocaleData != null) {
        if (props.key) {
          const localeString = get(localeData, props.key);
          const englishString = get(enLocaleData, props.key);

          // Fallback to english whenever a key doesn't exist for other languages
          formattedString = localeString || englishString || '';
        }
      }

      return formatString(formattedString, props.params);
    }

    return '';
  };
};

export const getStringForLocaleDate = createSelector(
  [
    (_state, params: StringGetterProps) => params,
    getSelectedLocaleData,
    getEnLocaleData,
    getIsLocaleLoaded,
  ],
  (params, localeData, enLocaleDate, isLocaleLoaded) => {
    if (!isLocaleLoaded) return '';

    const localeString = get(localeData, params.key);
    if (localeString) return formatString(localeString, params.params);

    const enString = get(enLocaleDate, params.key);
    if (enString) return formatString(enString, params.params);

    return params.fallback ? formatString(params.fallback, params.params) : '';
  }
);

/**
 * @param state
 * @returns
 */
export const getLocaleStringGetter = createAppSelector(
  [getSelectedLocaleData, getEnLocaleData, getIsLocaleLoaded],
  getStringGetterForLocaleData
);

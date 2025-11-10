// implemntation based on https://github.com/stefalda/react-localization/blob/master/src/LocalizedStrings.js
import React from 'react';

const PLACEHOLDER_REGEX = /(\{[\d|\w]+\})/;

export type StringGetterParams = Record<string, any>;

/**
 * String interpolation function that replaces placeholders in localized strings with dynamic values.
 *
 * This function processes template strings containing placeholders (e.g., "{name}", "{amount}") and
 * replaces them with values from the params object. It has special handling for React elements,
 * enabling rich formatting within localized strings.
 *
 * @param str - The template string containing placeholders in the format {key}
 * @param params - Object mapping placeholder keys to their replacement values (strings, numbers, or React elements)
 *
 * @returns
 * - `string` - When all params are primitive values (strings, numbers, etc.)
 * - `Array<string | React.ReactNode>` - When any param is a React element
 *
 * @example
 * // Basic interpolation - returns string
 * formatString('Hello {name}!', { name: 'Alice' })
 * // => "Hello Alice!"
 *
 * @example
 * // With React elements - returns array
 * formatString('Click {link} to continue', {
 *   link: <a href="/home">here</a>
 * })
 * // => ['Click ', <a href="/home">here</a>, ' to continue']
 *
 * @example
 * // Real-world usage with multiple React elements
 * formatString('I agree to the {TERMS} and {PRIVACY}', {
 *   TERMS: <Link href="/terms">Terms of Service</Link>,
 *   PRIVACY: <Link href="/privacy">Privacy Policy</Link>
 * })
 * // => ['I agree to the ', <Link>Terms of Service</Link>, ' and ', <Link>Privacy Policy</Link>]
 *
 * @note
 * - Placeholders are matched using the regex pattern /(\{[\d|\w]+\})/
 * - Typically used indirectly via `useStringGetter()` hook, not called directly
 * - When React elements are detected (via React.isValidElement), the return type changes to array
 */
const formatString = <T extends StringGetterParams>(
  str: string,
  params?: T
): string | Array<string | React.ReactNode> => {
  let hasObject = false;
  const res = (str || '')
    .split(PLACEHOLDER_REGEX)
    .filter((textPart) => !!textPart)
    .map((textPart, index) => {
      if (textPart.match(PLACEHOLDER_REGEX)) {
        const matchedKey = textPart.slice(1, -1);
        const valueForPlaceholder = params?.[matchedKey];

        if (React.isValidElement(valueForPlaceholder)) {
          hasObject = true;
          return React.Children.toArray(valueForPlaceholder).map((component) => ({
            ...(component as React.ReactElement),
            key: index.toString(),
          }));
        }

        return valueForPlaceholder;
      }
      return textPart;
    });
  // If the results contains a object return an array otherwise return a string
  if (hasObject) return res;
  return res.join('');
};

export default formatString;

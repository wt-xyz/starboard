import { useEffect, useState } from 'react';

/**
 * Reactively tracks whether a CSS media query matches.
 *
 */
export function useMediaQuery(query: string, defaultState = false) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultState;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const onChange = () => setMatches(mediaQueryList.matches);

    // Set initial in case query changed between renders.
    onChange();

    // Safari < 14 uses addListener/removeListener.
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', onChange);
      return () => mediaQueryList.removeEventListener('change', onChange);
    }

    // eslint-disable-next-line
    mediaQueryList.addListener(onChange);
    // eslint-disable-next-line
    return () => mediaQueryList.removeListener(onChange);
  }, [query]);

  return matches;
}

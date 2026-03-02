import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';
import { lightTheme } from '@/styles/theme.light.css';
import { starboardTheme } from '@/styles/theme.starboard.css';
import type { ThemeContextType } from './ThemeContext';
import { ThemeContext, type ThemePreference } from './ThemeContext';

export interface ThemeContextProviderProps {
  children: (value: ThemeContextType) => ReactNode;
}

export const ThemeContextProvider: FC<ThemeContextProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    const initial = getInitialTheme();
    applyThemeClass(initial);
    return initial;
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyThemeClass(next);
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext value={{ theme, toggleTheme }}>{children(contextValue)}</ThemeContext>;
};

function getInitialTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage disabled */
  }
  return 'dark';
}

function applyThemeClass(theme: ThemePreference) {
  const root = document.documentElement;
  root.classList.remove(THEME_CLASSES.dark, THEME_CLASSES.light);
  root.classList.add(THEME_CLASSES[theme]);
}

const STORAGE_KEY = 'starboard-theme';

const THEME_CLASSES: Record<ThemePreference, string> = {
  dark: starboardTheme,
  light: lightTheme,
};

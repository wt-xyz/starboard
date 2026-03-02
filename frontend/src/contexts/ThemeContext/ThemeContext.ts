import { createContext } from 'react';

export type ThemePreference = 'dark' | 'light';

export interface ThemeContextType {
  theme: ThemePreference;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);
ThemeContext.displayName = 'ThemeContext';

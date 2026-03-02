import { use } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '@/styles/theme.light.css';
import { starboardTheme } from '@/styles/theme.starboard.css';
import { ThemeContext } from './ThemeContext';
import { ThemeContextProvider } from './ThemeContextProvider';

const STORAGE_KEY = 'starboard-theme';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
};
vi.stubGlobal('localStorage', localStorageMock);

function ThemeConsumer() {
  const ctx = use(ThemeContext)!;
  return (
    <div>
      <span data-testid="theme">{ctx.theme}</span>
      <button onClick={ctx.toggleTheme}>Toggle</button>
    </div>
  );
}

function renderProvider() {
  return render(<ThemeContextProvider>{() => <ThemeConsumer />}</ThemeContextProvider>);
}

describe('ThemeContextProvider', () => {
  beforeEach(() => {
    delete store[STORAGE_KEY];
    document.documentElement.classList.remove(starboardTheme, lightTheme);
  });

  afterEach(() => {
    delete store[STORAGE_KEY];
    document.documentElement.classList.remove(starboardTheme, lightTheme);
  });

  describe('initial theme', () => {
    it('defaults to dark when localStorage is empty', () => {
      renderProvider();

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(true);
      expect(document.documentElement.classList.contains(lightTheme)).toBe(false);
    });

    it('restores dark theme from localStorage', () => {
      store[STORAGE_KEY] = 'dark';
      renderProvider();

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(true);
    });

    it('restores light theme from localStorage', () => {
      store[STORAGE_KEY] = 'light';
      renderProvider();

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains(lightTheme)).toBe(true);
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(false);
    });

    it('defaults to dark when localStorage has an invalid value', () => {
      store[STORAGE_KEY] = 'blue';
      renderProvider();

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(true);
    });
  });

  describe('toggleTheme', () => {
    it('switches from dark to light', async () => {
      const user = userEvent.setup();
      renderProvider();

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains(lightTheme)).toBe(true);
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(false);
    });

    it('switches from light to dark', async () => {
      const user = userEvent.setup();
      store[STORAGE_KEY] = 'light';
      renderProvider();

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(true);
      expect(document.documentElement.classList.contains(lightTheme)).toBe(false);
    });

    it('persists the new theme to localStorage', async () => {
      const user = userEvent.setup();
      renderProvider();

      await user.click(screen.getByRole('button', { name: 'Toggle' }));

      expect(store[STORAGE_KEY]).toBe('light');
    });

    it('round-trips through multiple toggles', async () => {
      const user = userEvent.setup();
      renderProvider();
      const button = screen.getByRole('button', { name: 'Toggle' });

      await user.click(button);
      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      await user.click(button);
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains(starboardTheme)).toBe(true);
      expect(store[STORAGE_KEY]).toBe('dark');
    });
  });
});

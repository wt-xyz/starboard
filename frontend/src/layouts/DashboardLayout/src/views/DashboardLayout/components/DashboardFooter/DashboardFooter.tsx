import { use } from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import { componentize } from '@/lib/componentize';
import * as $ from './DashboardFooter.css';

export function DashboardFooter() {
  const { theme, toggleTheme } = use(ThemeContext)!;

  return (
    <$$.footer>
      <a
        css={$.attribution}
        href="https://www.tradingview.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Charts by TradingView
      </a>
      <button
        css={$.themeToggle}
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </$$.footer>
  );
}

const $$ = componentize($);

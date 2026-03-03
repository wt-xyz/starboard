import { createTheme } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

export const lightTheme = createTheme(vars, {
  color: {
    pageBg: 'oklch(96% 0.005 280)',
    cardBg: 'oklch(99% 0.002 280)',
    surfaceElevated: 'oklch(94% 0.003 280)',
    inputBg: 'oklch(92% 0 0)',
    surfaceHover: 'oklch(89% 0 0)',

    textPrimary: 'oklch(15% 0 0)',
    textSecondary: 'oklch(40% 0 0)',
    textMuted: 'oklch(55% 0 0)',
    textDisabled: 'oklch(58% 0 0)',

    primary: 'oklch(55% 0.22 35)',
    primaryHover: 'oklch(48% 0.22 35)',
    primaryActive: 'oklch(42% 0.22 35)',
    primarySubtle: 'oklch(92% 0.04 35)',

    success: 'oklch(50% 0.17 155)',
    successHover: 'oklch(44% 0.17 155)',
    successSubtle: 'oklch(92% 0.04 155)',
    error: 'oklch(50% 0.22 25)',
    errorHover: 'oklch(44% 0.22 25)',
    errorSubtle: 'oklch(92% 0.04 25)',
    warning: 'oklch(60% 0.16 85)',
    warningSubtle: 'oklch(92% 0.04 85)',

    surfaceDisabled: 'oklch(92% 0 0)',

    borderSubtle: 'color-mix(in oklch, black 5%, transparent)',
    borderDefault: 'color-mix(in oklch, black 10%, transparent)',
    borderStrong: 'color-mix(in oklch, black 20%, transparent)',

    overlay: 'oklch(0% 0 0 / 40%)',
    focusRing: 'oklch(55% 0.20 260)',
  },

  focus: {
    ringWidth: '2px',
    ringOffset: '2px',
  },

  a11y: {
    minTargetSize: '44px',
  },

  radius: {
    button: '8px',
    input: '8px',
    card: '8px',
    panel: '12px',
    full: '9999px',
  },

  font: {
    body: 'system-ui, -apple-system, sans-serif',
  },

  fontSize: {
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    subtitle: '1.125rem',
    bodyLg: '1rem',
    body: '0.875rem',
    bodySm: '0.8125rem',
    caption: '0.75rem',
    label: '0.6875rem',
    micro: '0.625rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  lineHeight: {
    tight: '1.1',
    normal: '1.4',
    relaxed: '1.5',
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.03em',
  },

  space: {
    '2xs': '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  transition: {
    fast: '100ms',
    normal: '150ms',
    slow: '300ms',
  },
});

import { createTheme } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

const base = {
  primary: 'oklch(65% 0.22 35)',
  success: 'oklch(64% 0.17 155)',
  error: 'oklch(58% 0.22 25)',
  warning: 'oklch(78% 0.16 85)',
  surface: 'oklch(22% 0.006 286)',
  text: 'oklch(99% 0 0)',
} as const;

export const starboardTheme = createTheme(vars, {
  color: {
    pageBg: 'oklch(19.5% 0.01 295)',
    cardBg: 'oklch(22.3% 0.006 286)',
    surfaceElevated: 'oklch(24.5% 0.003 288)',
    inputBg: 'oklch(26.9% 0 0)',
    surfaceHover: 'oklch(29.5% 0 0)',

    textPrimary: base.text,
    textSecondary: 'oklch(62.3% 0 0)',
    textMuted: 'oklch(50% 0 0)',
    textDisabled: 'oklch(38% 0 0)',

    primary: base.primary,
    primaryHover: 'oklch(58% 0.22 35)',
    primaryActive: 'oklch(52% 0.22 35)',
    primarySubtle: 'oklch(20% 0.04 35)',

    success: base.success,
    successHover: 'oklch(58% 0.17 155)',
    successSubtle: 'oklch(20% 0.04 155)',
    error: base.error,
    errorHover: 'oklch(52% 0.22 25)',
    errorSubtle: 'oklch(20% 0.04 25)',
    warning: base.warning,
    warningSubtle: 'oklch(25% 0.04 85)',

    surfaceDisabled: 'oklch(26.9% 0 0)',

    borderSubtle: 'color-mix(in oklch, white 5%, transparent)',
    borderDefault: 'color-mix(in oklch, white 10%, transparent)',
    borderStrong: 'color-mix(in oklch, white 20%, transparent)',

    overlay: 'oklch(0% 0 0 / 70%)',
    focusRing: 'oklch(65% 0.20 260)',
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

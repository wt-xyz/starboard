import { createTheme } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

const base = {
  primary: '#FF6B0F',
  dark: '#1C1C1C',
  white: '#FFFFFF',
  success: 'oklch(64% 0.17 155)',
  error: 'oklch(58% 0.22 25)',
  warning: 'oklch(78% 0.16 85)',
} as const;

export const starboardTheme = createTheme(vars, {
  color: {
    pageBg: '#111111',
    cardBg: base.dark,
    surfaceElevated: '#252525',
    inputBg: '#2C2C2C',
    surfaceHover: '#333333',

    textPrimary: base.white,
    textSecondary: '#9E9E9E',
    textMuted: '#737373',
    textDisabled: '#737373',

    primary: base.primary,
    primaryHover: 'oklch(64% 0.197 46)',
    primaryActive: 'oklch(57% 0.197 46)',
    primarySubtle: 'oklch(20% 0.04 46)',

    success: base.success,
    successHover: 'oklch(58% 0.17 155)',
    successSubtle: 'oklch(20% 0.04 155)',
    error: base.error,
    errorHover: 'oklch(52% 0.22 25)',
    errorSubtle: 'oklch(20% 0.04 25)',
    warning: base.warning,
    warningSubtle: 'oklch(25% 0.04 85)',

    surfaceDisabled: '#2C2C2C',

    borderSubtle: 'color-mix(in oklch, white 5%, transparent)',
    borderDefault: 'color-mix(in oklch, white 10%, transparent)',
    borderStrong: 'color-mix(in oklch, white 20%, transparent)',

    overlay: 'oklch(0% 0 0 / 70%)',
    focusRing: base.primary,
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
    body: "Manrope, 'Neurial Grotesk', sans-serif",
    display: "'Neurial Grotesk', Manrope, sans-serif",
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

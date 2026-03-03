import { createTheme } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

export const lightTheme = createTheme(vars, {
  color: {
    pageBg: '#ECECEC',
    cardBg: '#FFFFFF',
    surfaceElevated: '#F5F5F5',
    inputBg: '#EBEBEB',
    surfaceHover: '#E0E0E0',

    textPrimary: '#1C1C1C',
    textSecondary: '#525252',
    textMuted: '#737373',
    textDisabled: '#9E9E9E',

    primary: 'oklch(55% 0.197 46)',
    primaryHover: 'oklch(48% 0.197 46)',
    primaryActive: 'oklch(42% 0.197 46)',
    primarySubtle: 'oklch(92% 0.04 46)',

    success: 'oklch(50% 0.17 155)',
    successHover: 'oklch(44% 0.17 155)',
    successSubtle: 'oklch(92% 0.04 155)',
    error: 'oklch(50% 0.22 25)',
    errorHover: 'oklch(44% 0.22 25)',
    errorSubtle: 'oklch(92% 0.04 25)',
    warning: 'oklch(60% 0.16 85)',
    warningSubtle: 'oklch(92% 0.04 85)',

    surfaceDisabled: '#E8E8E8',

    borderSubtle: 'color-mix(in oklch, black 5%, transparent)',
    borderDefault: 'color-mix(in oklch, black 10%, transparent)',
    borderStrong: 'color-mix(in oklch, black 20%, transparent)',

    overlay: 'oklch(0% 0 0 / 40%)',
    focusRing: 'oklch(55% 0.197 46)',
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

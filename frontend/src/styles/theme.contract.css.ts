import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    // Surfaces (5-layer elevation hierarchy)
    pageBg: '',
    cardBg: '',
    surfaceElevated: '',
    inputBg: '',
    surfaceHover: '',

    // Text hierarchy (4-tier)
    textPrimary: '',
    textSecondary: '',
    textMuted: '',
    textDisabled: '',

    // Brand accent
    primary: '',
    primaryHover: '',
    primaryActive: '',
    primarySubtle: '',

    // Semantic
    success: '',
    successHover: '',
    successSubtle: '',
    error: '',
    errorHover: '',
    errorSubtle: '',
    warning: '',
    warningSubtle: '',

    // Disabled surfaces
    surfaceDisabled: '',

    // Borders (3-tier)
    borderSubtle: '',
    borderDefault: '',
    borderStrong: '',

    // Overlay
    overlay: '',

    // Focus ring (WCAG 2.4.7, 2.4.11, 2.4.12)
    focusRing: '',
  },

  // Focus indicator dimensions (WCAG 2.4.12)
  focus: {
    ringWidth: '',
    ringOffset: '',
  },

  // Minimum interactive target size (WCAG 2.5.8)
  a11y: {
    minTargetSize: '',
  },

  // Semantic radius tokens
  radius: {
    button: '',
    input: '',
    card: '',
    panel: '',
    full: '',
  },

  // Font
  font: {
    body: '',
  },

  // Type scale
  fontSize: {
    h1: '',
    h2: '',
    h3: '',
    subtitle: '',
    bodyLg: '',
    body: '',
    bodySm: '',
    caption: '',
    label: '',
    micro: '',
  },
  fontWeight: {
    normal: '',
    medium: '',
    semibold: '',
  },
  lineHeight: {
    tight: '',
    normal: '',
    relaxed: '',
  },
  letterSpacing: {
    tight: '',
    normal: '',
    wide: '',
  },

  // Spacing (4-point grid)
  space: {
    '2xs': '',
    xs: '',
    sm: '',
    md: '',
    lg: '',
    xl: '',
    '2xl': '',
  },

  // Transitions
  transition: {
    fast: '',
    normal: '',
    slow: '',
  },
});

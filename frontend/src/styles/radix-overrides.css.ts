import { globalStyle } from '@vanilla-extract/css';
import { colors } from './colors';

/**
 * Ensure Radix Themes modals always appear above app-level fixed UI
 * like the mobile bottom menu and sheet.
 */
globalStyle('.rt-DialogOverlay', {
  zIndex: 1000,
});

/* Radix Themes applies the overlay background via a ::before pseudo-element */
globalStyle('.rt-DialogOverlay::before', {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
});

globalStyle('.rt-DialogContent', {
  zIndex: 1001,
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.75rem',
  border: `1px solid ${colors.whiteAlpha[10]}`,
  /* Override Radix Themes' --shadow-6 which includes its own border-like outline */
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
});

globalStyle('.rt-DialogContent .rt-DialogTitle', {
  color: colors.snow,
  fontSize: '1.125rem',
  fontWeight: 600,
});

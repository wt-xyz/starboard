import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

/**
 * Ensure Radix Themes modals always appear above app-level fixed UI
 * like the mobile bottom menu and sheet.
 */
globalStyle('.rt-DialogOverlay', {
  zIndex: 1000,
});

/* Radix Themes applies the overlay background via a ::before pseudo-element */
globalStyle('.rt-DialogOverlay::before', {
  backgroundColor: vars.color.overlay,
});

globalStyle('.rt-DialogContent', {
  zIndex: 1001,
  backgroundColor: vars.color.cardBg,
  borderRadius: vars.radius.panel,
  border: `1px solid ${vars.color.borderDefault}`,
  /* Override Radix Themes' --shadow-6 which includes its own border-like outline */
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
});

globalStyle('.rt-DialogContent .rt-DialogTitle', {
  color: vars.color.textPrimary,
  fontSize: '1.125rem',
  fontWeight: 600,
});

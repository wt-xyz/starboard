import { globalStyle } from '@vanilla-extract/css';

/**
 * Ensure Radix Themes modals always appear above app-level fixed UI
 * like the mobile bottom menu and sheet.
 */
globalStyle('.rt-DialogOverlay', {
  zIndex: 1000,
});

globalStyle('.rt-DialogContent', {
  zIndex: 1001,
});


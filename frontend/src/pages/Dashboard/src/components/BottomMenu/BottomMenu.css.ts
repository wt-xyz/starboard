import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const bar = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 40,
  display: 'none',
  backgroundColor: vars.color.cardBg,
  borderTop: `1px solid ${vars.color.borderDefault}`,
  padding: 0,
  paddingBottom: 'env(safe-area-inset-bottom)',
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
  '@media': {
    '(max-width: 1024px)': {
      display: 'flex',
      gap: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
});

export const barButton = style({
  flex: '1 1 50%',
  width: '50%',
  padding: '0.875rem 1rem',
  backgroundColor: 'transparent',
  border: 'none',
  color: vars.color.textSecondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  position: 'relative',
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: vars.color.surfaceHover,
  },
  ':active': {
    transform: 'scale(0.95)',
  },
  selectors: {
    '&[data-active="true"]': {
      color: vars.color.primary,
      backgroundColor: alpha(vars.color.primary, 15),
      fontWeight: 600,
    },
  },
});

export const barSeparator = style({
  width: '1px',
  height: '2rem',
  backgroundColor: vars.color.borderDefault,
  flexShrink: 0,
  alignSelf: 'center',
});

export const sheetContent = style({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  minHeight: 0,
  position: 'relative',
});

export const tabsList = style({
  display: 'flex',
  gap: 0,
  backgroundColor: vars.color.cardBg,
  borderRadius: 0,
  padding: 0,
});

export const tabsTrigger = style({
  flex: '1 1 50%',
  width: '50%',
  padding: '0.625rem 1rem',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 0,
  color: vars.color.textSecondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  textAlign: 'center',
  ':hover': {
    color: vars.color.textPrimary,
  },
  ':active': {
    transform: 'scale(0.98)',
  },
  selectors: {
    '&[data-state="active"][data-tab="long"]': {
      color: vars.color.success,
      backgroundColor: alpha(vars.color.success, 20),
      borderBottom: `2px solid ${vars.color.success}`,
      fontWeight: 600,
    },
    '&[data-state="active"][data-tab="short"]': {
      color: vars.color.error,
      backgroundColor: alpha(vars.color.error, 20),
      borderBottom: `2px solid ${vars.color.error}`,
      fontWeight: 600,
    },
  },
});

export const tabsBody = style({
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  minHeight: 0,
});

export const tabContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  outline: 'none',
});

export const orderEntryFormWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

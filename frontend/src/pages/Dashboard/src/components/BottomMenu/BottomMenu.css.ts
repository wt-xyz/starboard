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
  padding: `7px ${vars.space.sm}`,
  paddingBottom: `calc(7px + env(safe-area-inset-bottom))`,
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
  '@media': {
    '(max-width: 1024px)': {
      display: 'flex',
      alignItems: 'center',
      gap: vars.space.sm,
    },
  },
});

export const buttonGroup = style({
  display: 'flex',
  flex: 1,
  borderRadius: vars.radius.button,
  overflow: 'hidden',
});

export const sideButton = style({
  flex: 1,
  height: '32px',
  padding: '0 1rem',
  fontSize: '13px',
  backgroundColor: vars.color.inputBg,
  border: 'none',
  borderBottom: '2px solid transparent',
  color: vars.color.textSecondary,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: vars.color.surfaceHover,
  },
  ':active': {
    backgroundColor: vars.color.surfaceHover,
  },
  selectors: {
    '&[data-active="true"][data-side="long"]': {
      backgroundColor: alpha(vars.color.success, 20),
      color: vars.color.success,
      borderBottomColor: vars.color.success,
    },
    '&[data-active="true"][data-side="short"]': {
      backgroundColor: alpha(vars.color.error, 20),
      color: vars.color.error,
      borderBottomColor: vars.color.error,
    },
  },
});

export const chevronButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  flexShrink: 0,
  borderRadius: vars.radius.button,
  backgroundColor: 'transparent',
  border: `1px solid ${vars.color.borderStrong}`,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    color: vars.color.textPrimary,
  },
});

export const sheetTabsRoot = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
});

export const sheetHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  padding: `7px ${vars.space.sm}`,
  flexShrink: 0,
});

export const sheetContent = style({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  WebkitOverflowScrolling: 'touch',
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

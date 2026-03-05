import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  backgroundColor: vars.color.cardBg,
  borderRadius: vars.radius.card,
  overflow: 'hidden',
  '@media': {
    '(max-width: 1023px)': {
      height: 'auto',
      overflow: 'clip',
    },
  },
});

export const tabsRoot = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  '@media': {
    '(max-width: 1023px)': {
      flex: 'none',
      minHeight: 'auto',
    },
  },
});

export const tabsBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderBottom: `1px solid ${vars.color.borderDefault}`,
  backgroundColor: vars.color.cardBg,
  padding: '0 0.5rem',
});

export const tabsList = style({
  display: 'flex',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const closeAllButton = style({
  fontSize: vars.fontSize.caption,
  fontWeight: 500,
  color: vars.color.error,
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  transition: 'color 0.15s ease',
  ':hover': {
    color: vars.color.errorHover,
  },
  ':disabled': {
    color: vars.color.textDisabled,
    cursor: 'not-allowed',
  },
});

export const tabsTrigger = style({
  padding: '0.5rem 0.75rem',
  backgroundColor: 'transparent',
  color: vars.color.textSecondary,
  border: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: '-1px',
  cursor: 'pointer',
  fontSize: vars.fontSize.body,
  fontWeight: '500',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s ease',
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: alpha(vars.color.textPrimary, 5),
  },
  selectors: {
    '&[data-state="active"]': {
      color: vars.color.primary,
      borderBottomColor: vars.color.primary,
      fontWeight: '500',
    },
  },
  '@media': {
    '(max-width: 1024px)': {
      padding: '0.625rem 0.5rem',
      minHeight: '44px', // Touch-friendly
    },
  },
});

export const tabsContent = style({
  flex: 1,
  overflow: 'auto',
  padding: '0 0.5rem 0.5rem 0.5rem',
  minHeight: 0,
  WebkitOverflowScrolling: 'touch',
  '@media': {
    '(max-width: 1023px)': {
      flex: 'none',
      overflow: 'visible',
      minHeight: 'auto',
    },
  },
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 1rem',
  minHeight: '8rem',
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.body,
  textAlign: 'center',
});

export const emptyStateIcon = style({
  fontSize: '2rem',
  marginBottom: '0.5rem',
  opacity: 0.5,
});

export const emptyStateText = style({
  fontSize: vars.fontSize.body,
  color: vars.color.textSecondary,
});

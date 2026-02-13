import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const bar = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 40,
  display: 'none',
  backgroundColor: colors.gluonGrey,
  borderTop: `1px solid ${colors.whiteAlpha[10]}`,
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
  color: colors.dustyGrey,
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
    color: colors.snow,
    backgroundColor: colors.whiteAlpha[5],
  },
  ':active': {
    transform: 'scale(0.95)',
  },
  selectors: {
    '&[data-active="true"]': {
      color: colors.liquidLava,
      backgroundColor: colors.liquidLavaAlpha[15],
      fontWeight: 600,
    },
  },
});

export const barSeparator = style({
  width: '1px',
  height: '2rem',
  backgroundColor: colors.whiteAlpha[15],
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
  backgroundColor: colors.gluonGrey,
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
  color: colors.dustyGrey,
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  textAlign: 'center',
  ':hover': {
    color: colors.snow,
  },
  ':active': {
    transform: 'scale(0.98)',
  },
  selectors: {
    '&[data-state="active"][data-tab="long"]': {
      color: colors.success,
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderBottom: `2px solid ${colors.success}`,
      fontWeight: 600,
    },
    '&[data-state="active"][data-tab="short"]': {
      color: colors.error,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderBottom: `2px solid ${colors.error}`,
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

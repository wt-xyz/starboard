import { style } from '@vanilla-extract/css';
import { colors } from '../../../styles/colors';

export const page = style({
  width: '100%',
  height: 'calc(100vh - 4rem)', // Account for header height
  backgroundColor: colors.darkVoid,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: '1rem 1rem 0.5rem 1rem', // Further reduced bottom padding
  '@media': {
    '(max-width: 1024px)': {
      padding: '0.5rem',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
  },
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: '0.5rem', // Further reduced gap
  overflow: 'hidden',
  minHeight: 0,
  width: '100%',
  maxWidth: '100%',
  '::-webkit-scrollbar': {
    width: '4px',
    height: '4px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: colors.whiteAlpha[20],
    borderRadius: '2px',
  },
  '@media': {
    '(max-width: 1024px)': {
      height: 'auto',
      overflowX: 'hidden',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
  },
});

export const topSection = style({
  display: 'flex',
  flex: 1,
  gap: '0.5rem', // Further reduced gap
  overflow: 'hidden',
  minHeight: 0,
  '@media': {
    '(max-width: 1024px)': {
      flexDirection: 'column',
      flex: '0 0 auto',
      overflow: 'visible',
    },
  },
});

export const bottomSection = style({
  flex: '0 0 280px', // Reduced height to give more room to chart
  minHeight: 0,
  overflow: 'hidden',
  '@media': {
    '(max-width: 1024px)': {
      flex: '0 0 400px',
    },
  },
});

export const chartSection = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.5rem',
  overflow: 'hidden',
  position: 'relative',
  '@media': {
    '(max-width: 1024px)': {
      flex: 1,
      minWidth: 0,
      width: '100%',
    },
  },
});

export const orderEntrySection = style({
  flex: '0 0 400px',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  minHeight: 0,
  '@media': {
    '(max-width: 1024px)': {
      display: 'none',
    },
  },
});

export const orderEntryContainer = style({
  flex: '1 1 auto',
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.5rem',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
  overflow: 'auto',
  '::-webkit-scrollbar': {
    width: '4px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: colors.whiteAlpha[20],
    borderRadius: '2px',
  },
  '@media': {
    '(max-width: 1024px)': {
      minWidth: '640px',
      flex: '0 0 auto',
    },
  },
});

export const orderEntryFormWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const orderEntryTitle = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.snow,
  marginBottom: '1rem',
  textTransform: 'none',
  letterSpacing: '0.01em',
});

export const bottomMenu = style({
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

export const menuButton = style({
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

export const menuSeparator = style({
  width: '1px',
  height: '2rem',
  backgroundColor: colors.whiteAlpha[15],
  flexShrink: 0,
  alignSelf: 'center',
});

export const sheetContentWrapper = style({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  minHeight: 0,
  position: 'relative', // Create positioning context for dropdowns
});

export const sheetTabsWrapper = style({
  padding: 0,
});

export const sheetBodyWrapper = style({
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  minHeight: 0,
});

export const sheetMenuSelector = style({
  display: 'flex',
  gap: 0,
  backgroundColor: colors.gluonGrey,
  borderRadius: 0,
  padding: 0,
});

export const sheetMenuButton = style({
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

export const tabContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  outline: 'none',
});

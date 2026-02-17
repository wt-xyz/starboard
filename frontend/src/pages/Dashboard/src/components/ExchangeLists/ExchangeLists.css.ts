import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  backgroundColor: colors.gluonGrey,
  borderRadius: '0',
  overflow: 'visible',
});

export const tabsRoot = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
});

export const tabsList = style({
  display: 'flex',
  flexShrink: 0,
  borderBottom: `1px solid ${colors.whiteAlpha[10]}`,
  backgroundColor: colors.gluonGrey,
  padding: '0 0.5rem',
});

export const tabsTrigger = style({
  padding: '0.5rem 0.75rem',
  backgroundColor: 'transparent',
  color: colors.dustyGrey,
  border: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: '-1px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
  transition: 'all 0.15s ease',
  ':hover': {
    color: colors.snow,
    backgroundColor: colors.whiteAlpha[5],
  },
  selectors: {
    '&[data-state="active"]': {
      color: colors.liquidLava,
      borderBottomColor: colors.liquidLava,
      fontWeight: '600',
    },
  },
  '@media': {
    '(max-width: 1024px)': {
      padding: '0.75rem 1rem',
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
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 1rem',
  color: colors.dustyGrey,
  fontSize: '0.875rem',
  textAlign: 'center',
});

export const emptyStateIcon = style({
  fontSize: '2rem',
  marginBottom: '0.5rem',
  opacity: 0.5,
});

export const emptyStateText = style({
  fontSize: '0.875rem',
  color: colors.dustyGrey,
});

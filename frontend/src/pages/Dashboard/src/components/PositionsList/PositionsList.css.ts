import { style } from '@vanilla-extract/css';
import { colors } from '../../../../../styles/colors';

export const positionsContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 0.25rem',
});

export const headerTitle = style({
  fontSize: '0.8125rem',
  fontWeight: '600',
  color: colors.snow,
  letterSpacing: '-0.01em',
});

export const headerStats = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const statItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
});

export const statLabel = style({
  fontSize: '0.6875rem',
  color: colors.dustyGrey,
});

export const statValue = style({
  fontSize: '0.6875rem',
  fontWeight: '600',
  color: colors.snow,
  fontFamily: 'monospace',
});

export const closeAllButton = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: colors.error,
  backgroundColor: 'transparent',
  border: `1px solid ${colors.error}`,
  borderRadius: '0.375rem',
  padding: '0.25rem 0.75rem',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

export const positionCards = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const emptyState = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  minHeight: '4rem',
});

export const emptyStateText = style({
  fontSize: '0.875rem',
  color: colors.dustyGrey,
  textAlign: 'center',
});

export const desktopView = style({
  display: 'block',
  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
  },
});

export const mobileView = style({
  display: 'block',
  '@media': {
    '(min-width: 1024px)': {
      display: 'none',
    },
  },
});

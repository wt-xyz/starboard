import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const positionsContainer = style({
  display: 'flex',
  flexDirection: 'column',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 0.25rem',
});

export const headerTitle = style({
  fontSize: vars.fontSize.bodySm,
  fontWeight: '500',
  color: vars.color.textPrimary,
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
  fontSize: vars.fontSize.label,
  color: vars.color.textSecondary,
});

export const statValue = style({
  fontSize: vars.fontSize.label,
  fontWeight: '500',
  color: vars.color.textPrimary,
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
  minHeight: '6rem',
});

export const emptyStateText = style({
  fontSize: vars.fontSize.body,
  color: vars.color.textSecondary,
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

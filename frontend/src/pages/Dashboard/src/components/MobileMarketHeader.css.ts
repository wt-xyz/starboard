import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '0.5rem 0.75rem',
  backgroundColor: vars.color.cardBg,
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  gap: '0.375rem',
  overflow: 'hidden',
});

export const topRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
});

export const statsRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: vars.fontSize.micro,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
});

export const statItem = style({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '0.25rem',
  whiteSpace: 'nowrap',
  selectors: {
    '& + &::before': {
      content: '"·"',
      color: alpha(vars.color.textSecondary, 50),
      marginRight: '0.25rem',
    },
  },
});

export const statLabel = style({
  color: vars.color.textSecondary,
});

export const statValue = style({
  color: vars.color.textPrimary,
});

export const assetSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: '0 0 auto',
});

export const priceSection = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
  flex: '0 0 auto',
});

export const price = style({
  fontSize: vars.fontSize.bodyLg,
  fontWeight: '500',
  color: vars.color.textPrimary,
});

export const priceChange = style({
  fontSize: vars.fontSize.caption,
  fontWeight: '500',
});

export const priceChangePositive = style({
  color: vars.color.success,
});

export const priceChangeNegative = style({
  color: vars.color.error,
});

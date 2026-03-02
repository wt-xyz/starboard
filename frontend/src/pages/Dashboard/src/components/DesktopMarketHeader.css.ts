import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '0.5rem 0.75rem',
  borderBottom: `1px solid ${vars.color.borderDefault}`,
  backgroundColor: vars.color.cardBg,
  flexShrink: 0,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
  '@media': {
    '(max-width: 1024px)': {
      display: 'none',
    },
  },
});

export const priceGroup = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
});

export const price = style({
  fontSize: vars.fontSize.subtitle,
  fontWeight: '500',
  color: vars.color.textPrimary,
  whiteSpace: 'nowrap',
});

export const priceChangePositive = style({
  fontSize: vars.fontSize.bodySm,
  fontWeight: '500',
  color: vars.color.success,
  whiteSpace: 'nowrap',
});

export const priceChangeNegative = style({
  fontSize: vars.fontSize.bodySm,
  fontWeight: '500',
  color: vars.color.error,
  whiteSpace: 'nowrap',
});

export const separator = style({
  width: '1px',
  height: '1.5rem',
  backgroundColor: vars.color.borderDefault,
  flexShrink: 0,
});

export const statItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  whiteSpace: 'nowrap',
});

export const statLabel = style({
  fontSize: vars.fontSize.label,
  fontWeight: '500',
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const statValue = style({
  fontSize: vars.fontSize.bodySm,
  fontWeight: '500',
  color: vars.color.textPrimary,
});

export const statValuePositive = style({
  fontSize: vars.fontSize.bodySm,
  fontWeight: '500',
  color: vars.color.success,
});

export const statValueNegative = style({
  fontSize: vars.fontSize.bodySm,
  fontWeight: '500',
  color: vars.color.error,
});

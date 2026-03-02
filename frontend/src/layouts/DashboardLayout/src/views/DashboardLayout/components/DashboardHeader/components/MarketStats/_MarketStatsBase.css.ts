import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const stat = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const statLabel = style({
  fontSize: '0.6875rem',
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
});

export const statValue = style({
  fontSize: '0.75rem',
  color: vars.color.textPrimary,
  fontWeight: '500',
  lineHeight: 1.2,
});

export const statValuePositive = style({
  color: vars.color.success,
});

export const statValueNegative = style({
  color: vars.color.error,
});

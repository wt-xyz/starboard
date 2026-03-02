import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const statCell = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  minWidth: 0,
});

export const statLabel = style({
  fontSize: '0.5625rem',
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  lineHeight: 1,
});

export const statValue = style({
  fontSize: '0.875rem',
  color: vars.color.textPrimary,
  fontWeight: '600',
  lineHeight: 1.2,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const statValueSecondary = style({
  fontSize: '0.6875rem',
  color: vars.color.textSecondary,
  fontWeight: '500',
});

export const statValueMuted = style({
  color: vars.color.textSecondary,
});

export const statValuePositive = style({
  color: vars.color.success,
});

export const statValueNegative = style({
  color: vars.color.error,
});

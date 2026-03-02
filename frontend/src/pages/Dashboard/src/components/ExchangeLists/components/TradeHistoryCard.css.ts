import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const card = style({
  backgroundColor: vars.color.cardBg,
  borderRadius: '0.5rem',
  padding: '0.75rem',
  border: `1px solid ${vars.color.borderDefault}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const side = style({
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: vars.fontSize.label,
  fontWeight: '700',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
});

export const sideLong = style({
  backgroundColor: alpha(vars.color.success, 15),
  color: vars.color.success,
});

export const sideShort = style({
  backgroundColor: alpha(vars.color.error, 15),
  color: vars.color.error,
});

export const assetName = style({
  fontSize: vars.fontSize.body,
  fontWeight: '500',
  color: vars.color.textPrimary,
});

export const actionLabel = style({
  marginLeft: 'auto',
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: vars.fontSize.label,
  fontWeight: '500',
  backgroundColor: alpha(vars.color.textPrimary, 10),
  color: vars.color.textSecondary,
});

export const timestamp = style({
  fontSize: vars.fontSize.label,
  color: vars.color.textSecondary,
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.5rem',
  padding: '0.625rem',
  backgroundColor: alpha(vars.color.textPrimary, 5),
  borderRadius: '0.375rem',
});

export const statItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const statLabel = style({
  fontSize: vars.fontSize.label,
  color: vars.color.textSecondary,
});

export const statValue = style({
  fontSize: vars.fontSize.caption,
  fontWeight: '500',
  color: vars.color.textPrimary,
});

export const pnlPositive = style({
  color: vars.color.success,
});

export const pnlNegative = style({
  color: vars.color.error,
});

export const pnlMuted = style({
  color: vars.color.textSecondary,
});

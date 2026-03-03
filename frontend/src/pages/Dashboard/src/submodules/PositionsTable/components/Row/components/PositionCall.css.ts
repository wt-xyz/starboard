import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const assetInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const assetIcon = style({
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  flexShrink: 0,
  objectFit: 'cover',
});

export const assetMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
});

export const assetSubRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
});

export const assetSymbol = style({
  fontSize: '0.75rem',
  fontWeight: '600',
  color: vars.color.textPrimary,
});

export const assetLeverage = style({
  fontSize: vars.fontSize.body,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.textSecondary,
});

export const side = style({
  display: 'inline-block',
  padding: '0.0625rem 0.3125rem',
  borderRadius: '0.1875rem',
  fontSize: '0.5625rem',
  fontWeight: '700',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
});

export const sideLong = style({
  backgroundColor: alpha(vars.color.textPrimary, 10),
  color: vars.color.success,
});

export const sideShort = style({
  backgroundColor: alpha(vars.color.textPrimary, 10),
  color: vars.color.error,
});

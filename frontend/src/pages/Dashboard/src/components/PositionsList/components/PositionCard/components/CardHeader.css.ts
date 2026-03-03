import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const positionHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '0.75rem',
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginLeft: 'auto',
});

export const assetId = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '0.75rem',
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

export const assetIcon = style({
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  flexShrink: 0,
  objectFit: 'cover',
});

export const assetInfo = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
  flex: 1,
});

export const assetSymbol = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: vars.color.textPrimary,
  letterSpacing: '-0.01em',
});

export const iconButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: vars.a11y.minTargetSize,
  minHeight: vars.a11y.minTargetSize,
  border: `1px solid ${vars.color.borderDefault}`,
  borderRadius: '0.25rem',
  backgroundColor: 'transparent',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.borderStrong,
    color: vars.color.textPrimary,
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

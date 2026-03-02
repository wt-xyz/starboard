import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: vars.color.inputBg,
  border: `1px solid ${vars.color.inputBg}`,
  borderRadius: '0.5rem',
  padding: '10px 14px',
  gap: '2px',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.surfaceHover,
  },
  ':focus-within': {
    borderColor: vars.color.focusRing,
  },
});

export const label = style({
  fontSize: '0.688rem',
  color: vars.color.textSecondary,
  marginBottom: '2px',
  fontWeight: '400',
  letterSpacing: '0.01em',
  textTransform: 'capitalize',
});

export const inputWrapper = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '2px',
});

export const input = style({
  flex: 1,
  backgroundColor: 'transparent',
  border: 'none',
  color: vars.color.textPrimary,
  fontSize: '1rem',
  fontWeight: '400',
  outline: 'none',
  padding: 0,
  '::placeholder': {
    color: alpha(vars.color.textSecondary, 50),
  },
});

export const assetBadge = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 6px',
  backgroundColor: alpha(vars.color.textPrimary, 5),
  borderRadius: '4px',
  color: vars.color.textPrimary,
  fontSize: '0.813rem',
  fontWeight: '500',
  whiteSpace: 'nowrap',
});

export const footer = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.688rem',
  color: vars.color.textSecondary,
  marginTop: '2px',
  gap: '0.5rem',
});

export const usdValue = style({
  fontWeight: '400',
  marginRight: 'auto',
});

export const quickActions = style({
  display: 'flex',
  gap: '0.375rem',
});

export const quickButton = style({
  padding: '0.25rem 0.625rem',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: vars.color.textSecondary,
  backgroundColor: vars.color.surfaceHover,
  border: 'none',
  borderRadius: '9999px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: vars.color.inputBg,
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

export const error = style({
  color: vars.color.error,
  fontSize: '0.75rem',
  marginTop: '0.25rem',
  fontWeight: '400',
});

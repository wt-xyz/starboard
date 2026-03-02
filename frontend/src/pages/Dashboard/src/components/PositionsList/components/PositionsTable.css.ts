import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const actionsCell = style({
  padding: '0.5rem 0.625rem',
  verticalAlign: 'middle',
});

export const actionsRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'flex-end',
});

export const closeButton = style({
  fontSize: vars.fontSize.caption,
  fontWeight: 500,
  color: vars.color.error,
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  transition: 'color 0.15s ease',
  ':hover': {
    color: vars.color.errorHover,
  },
  ':disabled': {
    color: vars.color.textDisabled,
    cursor: 'not-allowed',
  },
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  padding: 0,
  backgroundColor: alpha(vars.color.textPrimary, 5),
  border: '1px solid transparent',
  borderRadius: '0.3125rem',
  color: vars.color.textPrimary,
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: alpha(vars.color.textPrimary, 10),
    borderColor: vars.color.borderStrong,
  },
});

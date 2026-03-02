import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const button = style({
  flex: 1,
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
  ':active': {
    backgroundColor: vars.color.primaryActive,
  },
});

export const disabled = style({
  backgroundColor: vars.color.surfaceDisabled,
  color: vars.color.textDisabled,
  cursor: 'not-allowed',
  ':hover': {
    backgroundColor: vars.color.surfaceDisabled,
  },
});

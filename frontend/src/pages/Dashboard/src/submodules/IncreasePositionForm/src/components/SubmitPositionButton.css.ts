import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const button = style({
  width: '100%',
  padding: '16px 24px',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginTop: '0.5rem',
  textTransform: 'capitalize',
  letterSpacing: '0.01em',
});

export const disabledButton = style({
  cursor: 'not-allowed',
  selectors: {
    '&&': {
      backgroundColor: vars.color.surfaceDisabled,
      color: vars.color.textDisabled,
    },
    '&&:hover': {
      backgroundColor: vars.color.surfaceDisabled,
    },
    '&&:active': {
      backgroundColor: vars.color.surfaceDisabled,
    },
  },
});

export const buyButton = style({
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
  ':active': {
    backgroundColor: vars.color.primaryActive,
  },
});

export const sellButton = style({
  backgroundColor: vars.color.error,
  color: vars.color.textPrimary,
  ':hover': {
    backgroundColor: vars.color.errorHover,
  },
  ':active': {
    backgroundColor: vars.color.errorHover,
  },
});

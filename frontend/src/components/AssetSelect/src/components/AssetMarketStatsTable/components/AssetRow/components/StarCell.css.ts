import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const starCell = style({
  textAlign: 'center',
});

export const starButton = style({
  background: 'none',
  border: 'none',
  padding: '0.125rem',
  cursor: 'pointer',
  color: vars.color.textSecondary,
  fontSize: '0.875rem',
  lineHeight: 1,
  transition: 'color 0.15s ease',
  ':hover': {
    color: vars.color.primary,
  },
});

export const starActive = style({
  color: vars.color.primary,
});

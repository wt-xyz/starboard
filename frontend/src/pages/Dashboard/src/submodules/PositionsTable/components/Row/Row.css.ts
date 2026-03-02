import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const tableRow = style({
  backgroundColor: vars.color.cardBg,
  transition: 'background-color 0.1s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
  },
  selectors: {
    '&:nth-child(even)': {
      backgroundColor: alpha(vars.color.textPrimary, 3),
    },
    '&:nth-child(even):hover': {
      backgroundColor: vars.color.surfaceHover,
    },
  },
});

export const positive = style({
  color: vars.color.success,
});

export const negative = style({
  color: vars.color.error,
});

export const muted = style({
  color: vars.color.textSecondary,
});

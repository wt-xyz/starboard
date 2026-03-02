import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/theme.contract.css';

export const cell = recipe({
  base: {
    padding: '0.5rem 0.625rem',
    fontSize: '0.8125rem',
    color: vars.color.textPrimary,
    verticalAlign: 'middle',
  },
  variants: {
    variant: {
      standard: {},
      error: { color: vars.color.error },
    },
  },
  defaultVariants: {
    variant: 'standard',
  },
});

export const cellContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.0625rem',
});

export const cellValue = style({
  fontWeight: '500',
});

export const cellSecondary = style({
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
});

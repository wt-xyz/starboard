import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const priceDisplay = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
});

export const price = style({
  fontSize: '1rem',
  fontWeight: '600',
  color: vars.color.textPrimary,
});

export const priceChange = style({
  fontSize: '0.75rem',
  fontWeight: '500',
});

export const priceChangePositive = style({
  color: vars.color.success,
});

export const priceChangeNegative = style({
  color: vars.color.error,
});

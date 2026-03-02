import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const root = style({
  textAlign: 'center',
  padding: '0.75rem 0',
  marginBottom: '0.75rem',
});

export const amount = style({
  fontSize: '1.5rem',
  fontWeight: '700',
  lineHeight: 1.2,
});

export const percentage = style({
  fontSize: '0.875rem',
  fontWeight: '500',
  opacity: 0.8,
  marginTop: '0.25rem',
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

import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const root = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  backgroundColor: alpha(vars.color.textPrimary, 5),
  borderRadius: '0.375rem',
  fontSize: '0.75rem',
});

export const icon = style({
  fontSize: '0.875rem',
});

export const label = style({
  color: vars.color.textSecondary,
});

export const value = style({
  color: vars.color.textPrimary,
  fontWeight: '500',
});

export const distance = style({
  color: vars.color.textSecondary,
  fontSize: '0.6875rem',
});

export const warning = style({
  color: vars.color.error,
});

export const danger = style({
  color: vars.color.error,
});

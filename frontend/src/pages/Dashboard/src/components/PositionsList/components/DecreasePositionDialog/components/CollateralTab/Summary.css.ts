import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const row = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const label = style({
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
});

export const value = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const arrow = style({
  color: vars.color.textSecondary,
});

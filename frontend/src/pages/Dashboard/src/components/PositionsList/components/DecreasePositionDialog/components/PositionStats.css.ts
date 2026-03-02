import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const cell = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  minWidth: 0,
});

export const label = style({
  fontSize: '0.5625rem',
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  lineHeight: 1,
});

export const value = style({
  fontSize: '0.875rem',
  color: vars.color.textPrimary,
  fontWeight: 600,
  lineHeight: 1.2,
});

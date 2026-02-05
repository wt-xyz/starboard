import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

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
  color: colors.dustyGrey,
});

export const value = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: colors.snow,
  fontFamily: 'monospace',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const arrow = style({
  color: colors.dustyGrey,
});

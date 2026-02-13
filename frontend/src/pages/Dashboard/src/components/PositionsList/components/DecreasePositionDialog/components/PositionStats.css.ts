import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const cell = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  minWidth: 0,
});

export const label = style({
  fontSize: '0.5625rem',
  color: colors.dustyGrey,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  lineHeight: 1,
});

export const value = style({
  fontSize: '0.875rem',
  color: colors.snow,
  fontWeight: 600,
  fontFamily: 'monospace',
  lineHeight: 1.2,
});

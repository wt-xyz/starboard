import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const placeholder = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 1.5rem',
});

export const placeholderText = style({
  color: colors.whiteAlpha[30],
  fontSize: '0.875rem',
});

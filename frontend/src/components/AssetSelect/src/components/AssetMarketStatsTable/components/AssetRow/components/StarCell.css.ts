import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const starCell = style({
  textAlign: 'center',
});

export const starButton = style({
  background: 'none',
  border: 'none',
  padding: '0.125rem',
  cursor: 'pointer',
  color: colors.dustyGrey,
  fontSize: '0.875rem',
  lineHeight: 1,
  transition: 'color 0.15s ease',
  ':hover': {
    color: colors.liquidLava,
  },
});

export const starActive = style({
  color: colors.liquidLava,
});

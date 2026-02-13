import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const positive = style({
  color: colors.success,
});

export const negative = style({
  color: colors.error,
});

export const muted = style({
  color: colors.dustyGrey,
});

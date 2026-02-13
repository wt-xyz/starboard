import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { colors } from '@/styles/colors';

export const cell = recipe({
  base: {
    padding: '0.5rem 0.625rem',
    fontSize: '0.75rem',
    color: colors.snow,
    borderTop: `1px solid ${colors.whiteAlpha[10]}`,
    borderBottom: `1px solid ${colors.whiteAlpha[10]}`,
    verticalAlign: 'middle',
    selectors: {
      '&:first-child': {
        borderLeft: `1px solid ${colors.whiteAlpha[10]}`,
        borderTopLeftRadius: '0.5rem',
        borderBottomLeftRadius: '0.5rem',
      },
      '&:last-child': {
        borderRight: `1px solid ${colors.whiteAlpha[10]}`,
        borderTopRightRadius: '0.5rem',
        borderBottomRightRadius: '0.5rem',
      },
    },
  },
  variants: {
    variant: {
      standard: {},
      error: { color: colors.error },
    },
  },
  defaultVariants: {
    variant: 'standard',
  },
});

export const cellContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.0625rem',
});

export const cellValue = style({
  fontFamily: 'monospace',
  fontWeight: '500',
});

export const cellSecondary = style({
  fontSize: '0.625rem',
  color: colors.dustyGrey,
  fontFamily: 'monospace',
});

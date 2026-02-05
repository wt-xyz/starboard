import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const summaryRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  selectors: {
    '&:not(:last-child)': {
      marginBottom: '0.5rem',
    },
  },
});

export const summaryLabel = style({
  fontSize: '0.75rem',
  color: colors.dustyGrey,
});

export const summaryValueGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '0.125rem',
});

export const summaryValue = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: colors.snow,
  fontFamily: 'monospace',
});

export const summaryValueSecondary = style({
  fontSize: '0.625rem',
  color: colors.dustyGrey,
  fontFamily: 'monospace',
});

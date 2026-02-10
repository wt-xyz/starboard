import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const tableRow = style({
  backgroundColor: colors.gluonGrey,
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: colors.slateGrey,
  },
});

export const cell = style({
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

export const side = style({
  display: 'inline-block',
  padding: '0.0625rem 0.3125rem',
  borderRadius: '0.1875rem',
  fontSize: '0.5625rem',
  fontWeight: '700',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
});

export const sideLong = style({
  backgroundColor: colors.whiteAlpha[10],
  color: colors.success,
});

export const sideShort = style({
  backgroundColor: colors.whiteAlpha[10],
  color: colors.error,
});

export const assetInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const assetSymbol = style({
  fontSize: '0.75rem',
  fontWeight: '600',
  color: colors.snow,
});

export const positive = style({
  color: colors.success,
});

export const negative = style({
  color: colors.error,
});

export const muted = style({
  color: colors.dustyGrey,
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  padding: 0,
  backgroundColor: colors.whiteAlpha[5],
  border: `1px solid ${colors.whiteAlpha[10]}`,
  borderRadius: '0.3125rem',
  color: colors.snow,
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: colors.whiteAlpha[10],
    borderColor: colors.whiteAlpha[20],
  },
});

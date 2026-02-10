import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const table = style({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 0.125rem',
  fontSize: '0.75rem',
});

export const headerRow = style({
  position: 'sticky',
  top: -1,
  zIndex: 1,
  backgroundColor: colors.gluonGrey,
});

export const headerCell = style({
  padding: '0.625rem 0.625rem 0.5rem 0.625rem',
  textAlign: 'left',
  fontSize: '0.625rem',
  fontWeight: '600',
  color: colors.dustyGrey,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: colors.gluonGrey,
  borderBottom: `1px solid ${colors.whiteAlpha[10]}`,
});

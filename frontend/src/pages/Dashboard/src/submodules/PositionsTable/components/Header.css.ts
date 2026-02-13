import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const headerRow = style({
  backgroundColor: colors.gluonGrey,
});

export const headerCell = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
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

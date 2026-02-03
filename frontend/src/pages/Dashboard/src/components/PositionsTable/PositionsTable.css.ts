import { colors } from '@/styles/colors';
import { style } from '@vanilla-extract/css';

export const table = style({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 0.25rem',
  fontSize: '0.8125rem',
});

export const headerRow = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
});

export const headerCell = style({
  padding: '0.75rem',
  textAlign: 'left',
  fontSize: '0.6875rem',
  fontWeight: '600',
  color: colors.dustyGrey,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backgroundColor: 'transparent',
  borderBottom: `1px solid ${colors.whiteAlpha[10]}`,
});

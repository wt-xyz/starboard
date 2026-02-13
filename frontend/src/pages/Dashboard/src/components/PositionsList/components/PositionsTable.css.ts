import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

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

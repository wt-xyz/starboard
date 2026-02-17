import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const actionsRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'flex-end',
});

export const closeButton = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: colors.error,
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  transition: 'color 0.15s ease',
  ':hover': {
    color: '#ff6b6b',
  },
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

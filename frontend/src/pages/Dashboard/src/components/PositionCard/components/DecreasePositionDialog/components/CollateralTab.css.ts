import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const actionSwitchSection = style({
  display: 'flex',
  justifyContent: 'center',
});

export const inputSection = style({});

export const actionsSection = style({
  display: 'flex',
  gap: '0.75rem',
});

export const cancelButton = style({
  flex: 1,
  padding: '0.75rem 1rem',
  backgroundColor: 'transparent',
  color: colors.dustyGrey,
  border: `1px solid ${colors.whiteAlpha[20]}`,
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    color: colors.snow,
    borderColor: colors.whiteAlpha[30],
    backgroundColor: colors.whiteAlpha[5],
  },
});

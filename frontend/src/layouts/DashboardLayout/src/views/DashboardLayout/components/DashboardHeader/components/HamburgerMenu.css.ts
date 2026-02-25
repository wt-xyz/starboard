import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const mobileMenuButton = style({
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.5rem',
  backgroundColor: 'transparent',
  border: `1px solid ${colors.whiteAlpha[20]}`,
  color: colors.snow,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: colors.whiteAlpha[10],
    borderColor: colors.whiteAlpha[30],
  },
  '@media': {
    '(max-width: 1024px)': {
      display: 'flex',
    },
  },
});

export const mobileMenuContent = style({
  padding: '0 1rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const mobileMenuSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  paddingBottom: '1rem',
  borderBottom: `1px solid ${colors.whiteAlpha[10]}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },
});

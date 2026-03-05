import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const mobileMenuButton = style({
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: vars.radius.button,
  backgroundColor: 'transparent',
  border: `1px solid ${vars.color.borderStrong}`,
  color: vars.color.textPrimary,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.borderStrong,
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
  borderBottom: `1px solid ${vars.color.borderDefault}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },
});

import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const footer = style({
  height: '3rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `0 ${vars.space.lg}`,
  backgroundColor: vars.color.pageBg,
  flexShrink: 0,
  '@media': {
    '(max-width: 1024px)': {
      display: 'none',
    },
  },
});

export const attribution = style({
  fontSize: vars.fontSize.micro,
  color: vars.color.textMuted,
  textDecoration: 'none',
  transition: `color ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.textSecondary,
  },
});

export const themeToggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  padding: vars.space.xs,
  cursor: 'pointer',
  color: vars.color.textSecondary,
  borderRadius: vars.radius.full,
  transition: `color ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.textPrimary,
  },
});

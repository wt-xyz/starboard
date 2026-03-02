import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const tabsList = style({
  display: 'flex',
  borderRadius: vars.radius.input,
  overflow: 'hidden',
  borderBottom: `1px solid ${vars.color.borderDefault}`,
});

export const tabsTrigger = style({
  flex: 1,
  padding: `${vars.space.sm} ${vars.space.lg}`,
  backgroundColor: vars.color.inputBg,
  color: vars.color.textSecondary,
  border: 'none',
  cursor: 'pointer',
  fontSize: vars.fontSize.body,
  fontWeight: vars.fontWeight.medium,
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.textPrimary,
  },
  selectors: {
    '&[data-state="active"][data-side="long"]': {
      color: vars.color.textPrimary,
      backgroundColor: alpha(vars.color.success, 20),
      boxShadow: `inset 0 -2px 0 ${vars.color.success}`,
    },
    '&[data-state="active"][data-side="short"]': {
      color: vars.color.textPrimary,
      backgroundColor: alpha(vars.color.error, 20),
      boxShadow: `inset 0 -2px 0 ${vars.color.error}`,
    },
  },
});

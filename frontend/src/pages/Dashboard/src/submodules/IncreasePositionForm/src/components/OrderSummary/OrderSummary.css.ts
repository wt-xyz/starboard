import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  border: `1px solid ${vars.color.borderDefault}`,
  borderRadius: vars.radius.card,
  padding: vars.space.md,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

export const row = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const label = style({
  fontSize: vars.fontSize.body,
  color: vars.color.textSecondary,
});

export const value = style({
  fontSize: vars.fontSize.body,
  fontWeight: 500,
  color: vars.color.textPrimary,
});

export const slippageRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
});

export const slippageButton = style({
  fontSize: vars.fontSize.caption,
  padding: '4px 8px',
  border: `1px solid ${vars.color.inputBg}`,
  borderRadius: '0.5rem',
  color: vars.color.textSecondary,
  background: vars.color.inputBg,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.surfaceHover,
  },
  selectors: {
    '&[data-active="true"]': {
      borderColor: vars.color.primary,
      color: vars.color.textPrimary,
    },
  },
});

export const slippageInput = style({
  width: '4ch',
  background: vars.color.inputBg,
  border: `1px solid ${vars.color.inputBg}`,
  borderRadius: '0.5rem',
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.caption,
  padding: '4px 8px',
  textAlign: 'right',
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.focusRing,
    },
  },
});

export const slippageSuffix = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.textSecondary,
});

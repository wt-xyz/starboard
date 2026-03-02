import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const networkSwitcherContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const networkLabel = style({
  display: 'none',
});

export const selectTrigger = recipe({
  base: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    backgroundColor: vars.color.inputBg,
    color: vars.color.textPrimary,
    height: '2.25rem',
    padding: '0 0.75rem',
    minWidth: '8rem',
    lineHeight: 1,
    borderRadius: vars.radius.button,
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontWeight: '500',
    fontSize: '0.875rem',
    ':hover': {
      backgroundColor: vars.color.cardBg,
      borderColor: vars.color.borderStrong,
    },
    ':focus': {
      outline: 'none',
      borderColor: vars.color.primary,
      boxShadow: `0 0 0 2px ${alpha(vars.color.primary, 20)}`,
    },
    selectors: {
      '&[data-state="open"]': {
        borderColor: vars.color.primary,
      },
      '&[data-disabled]': {
        color: vars.color.textDisabled,
        borderColor: vars.color.borderDefault,
        cursor: 'not-allowed',
      },
    },
  },
});

export const triggerIcon = style({
  color: vars.color.textSecondary,
  transition: 'transform 0.2s ease',
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)',
    },
  },
});

export const selectContent = style({
  backgroundColor: vars.color.cardBg,
  border: `1px solid ${vars.color.borderDefault}`,
  borderRadius: vars.radius.card,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  maxHeight: 'var(--radix-select-content-available-height)',
  minWidth: '8rem',
  overflow: 'hidden',
  padding: '0.25rem',
  zIndex: 50,
  animation: 'none !important',
});

export const selectItem = recipe({
  base: {
    all: 'unset',
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: 1,
    color: vars.color.textPrimary,
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    height: '2rem',
    padding: '0 0.75rem',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    transition: `background-color ${vars.transition.fast}`,
    ':hover': {
      backgroundColor: vars.color.surfaceHover,
    },
    ':focus': {
      backgroundColor: vars.color.surfaceHover,
    },
    selectors: {
      '&[data-highlighted]': {
        backgroundColor: vars.color.surfaceHover,
      },
      '&[data-state="checked"]': {
        backgroundColor: vars.color.surfaceHover,
      },
      '&[data-disabled]': {
        color: vars.color.textDisabled,
        cursor: 'not-allowed',
      },
    },
  },
});

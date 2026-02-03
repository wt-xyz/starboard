import { colors } from '@/styles/colors';
import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';

export const networkSwitcherContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const networkLabel = style({
  fontSize: '0.75rem',
  color: colors.dustyGrey,
  textTransform: 'uppercase',
  fontWeight: '600',
  letterSpacing: '0.05em',
});

export const selectTrigger = recipe({
  base: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    backgroundColor: colors.slateGrey,
    color: colors.snow,
    padding: '0.5rem 0.75rem',
    minWidth: '8rem',
    lineHeight: 1,
    borderRadius: '0.375rem',
    border: `1px solid ${colors.whiteAlpha[20]}`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontWeight: '600',
    fontSize: '0.875rem',
    ':hover': {
      backgroundColor: colors.gluonGrey,
      borderColor: colors.whiteAlpha[30],
    },
    ':focus': {
      outline: 'none',
      borderColor: colors.liquidLava,
      boxShadow: `0 0 0 2px ${colors.liquidLavaAlpha[20]}`,
    },
    selectors: {
      '&[data-state="open"]': {
        borderColor: colors.liquidLava,
      },
      '&[data-disabled]': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
});

export const triggerIcon = style({
  color: colors.dustyGrey,
  transition: 'transform 0.2s ease',
  selectors: {
    '[data-state="open"] &': {
      transform: 'rotate(180deg)',
    },
  },
});

export const selectContent = style({
  backgroundColor: colors.gluonGrey,
  border: `1px solid ${colors.slateGrey}`,
  borderRadius: '0.5rem',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  maxHeight: 'var(--radix-select-content-available-height)',
  minWidth: '8rem',
  overflow: 'hidden',
  padding: '0.25rem',
  zIndex: 50,
});

export const selectItem = recipe({
  base: {
    all: 'unset',
    fontSize: '0.875rem',
    fontWeight: '600',
    lineHeight: 1,
    color: colors.snow,
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    height: '2rem',
    padding: '0 0.75rem',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: colors.slateGrey,
    },
    ':focus': {
      backgroundColor: colors.slateGrey,
    },
    selectors: {
      '&[data-highlighted]': {
        backgroundColor: colors.slateGrey,
      },
      '&[data-state="checked"]': {
        backgroundColor: colors.slateGrey,
      },
      '&[data-disabled]': {
        color: colors.dustyGrey,
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
  },
});

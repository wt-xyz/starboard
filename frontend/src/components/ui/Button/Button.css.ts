import { style, styleVariants } from '@vanilla-extract/css';

const baseButton = style({
  cursor: 'pointer',
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 500,
  border: 'none',
  userSelect: 'none',
  fontFamily: 'inherit',
  transition: 'background-color 0.15s ease, color 0.15s ease',
  outline: 'none',
});

export const buttonVariants = styleVariants({
  primary: [
    baseButton,
    {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-white)',
      borderRadius: '8px',
      selectors: {
        '&:not([disabled]):hover': {
          backgroundColor: 'var(--color-primary-hover)',
        },
        '&:not([disabled]):active': {
          backgroundColor: 'var(--color-primary-active)',
        },
      },
    },
  ],
  secondary: [
    baseButton,
    {
      backgroundColor: 'var(--color-surface-secondary)',
      borderRadius: '8px',
      color: 'var(--color-text-secondary)',
      position: 'relative',
      letterSpacing: 0,
      selectors: {
        '&:not([disabled]):hover': {
          backgroundColor: 'var(--color-surface-hover)',
          color: 'var(--color-text-primary)',
        },
        '&:not([disabled]):active': {
          backgroundColor: 'var(--color-surface-secondary)',
          color: 'var(--color-text-primary)',
        },
      },
    },
  ],
  ghost: [
    baseButton,
    {
      backgroundColor: 'transparent',
      borderRadius: '8px',
      color: 'var(--color-text-secondary)',
      position: 'relative',
      letterSpacing: 0,
      selectors: {
        '&:not([disabled]):hover': {
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-surface-hover)',
        },
        '&:not([disabled]):active': {
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-surface-active)',
        },
      },
    },
  ],
});

export const buttonSizes = styleVariants({
  small: {
    minHeight: '32px',
    gap: '4px',
    padding: '8px 12px',
    fontSize: '13px',
  },
  medium: {
    minHeight: '40px',
    gap: '6px',
    padding: '10px 16px',
    fontSize: '14px',
  },
  large: {
    minHeight: '48px',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '16px',
  },
});

export const textAlignments = styleVariants({
  center: { justifyContent: 'center' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
});

export const disabledButton = style({
  boxShadow: 'none',
  cursor: 'not-allowed',
  color: 'var(--color-text-disabled)',
  backgroundColor: 'var(--color-surface-disabled)',
});

export const buttonImage = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxHeight: '1.5rem',
  maxWidth: '1.5rem',
});


import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/theme.contract.css';

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: vars.fontSize.body,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    whiteSpace: 'nowrap',
    selectors: {
      '&:disabled': {
        backgroundColor: vars.color.surfaceDisabled,
        color: vars.color.textDisabled,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: vars.color.primary,
        color: vars.color.textPrimary,
        ':hover': {
          backgroundColor: vars.color.primaryHover,
        },
        ':active': {
          backgroundColor: vars.color.primaryActive,
        },
      },
      secondary: {
        backgroundColor: vars.color.surfaceElevated,
        color: vars.color.textPrimary,
        ':hover': {
          backgroundColor: vars.color.surfaceHover,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: vars.color.textSecondary,
        ':hover': {
          backgroundColor: vars.color.surfaceHover,
          color: vars.color.textPrimary,
        },
      },
      danger: {
        backgroundColor: vars.color.error,
        color: vars.color.textPrimary,
        ':hover': {
          backgroundColor: vars.color.errorHover,
        },
      },
    },
    size: {
      sm: {
        height: '2rem',
        padding: '0 0.75rem',
        fontSize: vars.fontSize.bodySm,
      },
      md: {
        height: '2.5rem',
        padding: '0 1rem',
        fontSize: vars.fontSize.body,
      },
      lg: {
        height: '3rem',
        padding: '0 1.5rem',
        fontSize: vars.fontSize.bodyLg,
        fontWeight: '500',
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

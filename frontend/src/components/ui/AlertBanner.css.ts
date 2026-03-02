import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/theme.contract.css';

export const banner = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.625rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    borderLeft: '2px solid',
    fontSize: vars.fontSize.bodySm,
    lineHeight: '1.4',
    color: vars.color.textPrimary,
  },
  variants: {
    variant: {
      info: {
        backgroundColor: vars.color.primarySubtle,
        borderLeftColor: vars.color.primary,
      },
      warning: {
        backgroundColor: vars.color.warningSubtle,
        borderLeftColor: vars.color.warning,
      },
      error: {
        backgroundColor: vars.color.errorSubtle,
        borderLeftColor: vars.color.error,
      },
      success: {
        backgroundColor: vars.color.successSubtle,
        borderLeftColor: vars.color.success,
      },
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export const iconWrapper = style({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  marginTop: '1px',
});

export const message = style({
  flex: 1,
});

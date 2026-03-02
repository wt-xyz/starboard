import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const content = style({
  padding: '1.25rem',
  maxWidth: '380px',
  width: '100%',
});

export const title = style({
  fontSize: vars.fontSize.subtitle,
  fontWeight: 600,
  lineHeight: '1.1',
  color: vars.color.textPrimary,
  marginBottom: '0.5rem',
});

export const description = style({
  fontSize: vars.fontSize.body,
  color: vars.color.textSecondary,
  lineHeight: '1.5',
  marginBottom: '1.25rem',
});

export const actions = style({
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'flex-end',
});

const buttonBase = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  fontSize: vars.fontSize.body,
  fontWeight: '500' as const,
  cursor: 'pointer',
  transition: 'all 0.15s',
  border: 'none',
  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
};

export const cancelButton = style({
  ...buttonBase,
  backgroundColor: 'transparent',
  color: vars.color.textSecondary,
  border: `1px solid ${vars.color.borderDefault}`,
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    color: vars.color.textPrimary,
  },
});

export const confirmButton = style({
  ...buttonBase,
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
});

export const dangerButton = style({
  ...buttonBase,
  backgroundColor: vars.color.error,
  color: vars.color.textPrimary,
  ':hover': {
    backgroundColor: vars.color.errorHover,
  },
});

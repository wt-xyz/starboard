import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const actionSwitchSection = style({
  display: 'flex',
  justifyContent: 'center',
});

export const inputSection = style({});

export const summarySection = style({
  padding: '1rem',
  backgroundColor: alpha(vars.color.textPrimary, 5),
  borderRadius: '0.5rem',
});

export const actionsSection = style({
  display: 'flex',
  gap: '0.75rem',
});

export const cancelButton = style({
  flex: 1,
  padding: '0.75rem 1rem',
  backgroundColor: 'transparent',
  color: vars.color.textSecondary,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    color: vars.color.textPrimary,
    borderColor: vars.color.borderStrong,
    backgroundColor: vars.color.surfaceHover,
  },
});

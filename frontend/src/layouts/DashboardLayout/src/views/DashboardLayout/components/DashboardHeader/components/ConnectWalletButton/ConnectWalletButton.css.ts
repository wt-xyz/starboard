import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const walletButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '2.25rem',
  padding: '0 1.25rem',
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  borderRadius: vars.radius.button,
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
});

export const walletConnected = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  height: '2.25rem',
  padding: '0 0.75rem 0 0.5rem',
  backgroundColor: vars.color.surfaceElevated,
  color: vars.color.textPrimary,
  borderRadius: vars.radius.button,
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  position: 'relative',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
  },
});

export const walletAvatar = style({
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  flexShrink: 0,
});

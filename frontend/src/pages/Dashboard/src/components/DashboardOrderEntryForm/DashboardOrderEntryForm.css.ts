import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  width: '100%',
  backgroundColor: vars.color.cardBg,
  borderRadius: vars.radius.card,
  padding: vars.space.sm,
  boxSizing: 'border-box',
});

export const separator = style({
  height: 0,
  borderTop: `1px solid ${vars.color.borderDefault}`,
  marginLeft: `calc(-1 * ${vars.space.sm})`,
  marginRight: `calc(-1 * ${vars.space.sm})`,
});

export const connectWalletButton = style({
  marginTop: vars.space.xs,
  width: '100%',
  padding: '0.5rem 1.25rem',
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
});

export const connectWalletMessage = style({
  marginTop: '0.75rem',
  display: 'block',
});

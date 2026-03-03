import { assignVars, style } from '@vanilla-extract/css';
import { connectWalletThemeVars } from '@/components/ConnectWalletButton/vars.css';
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

export const formConnectWalletWrapper = style({
  vars: assignVars(connectWalletThemeVars, {
    width: '100%',
    marginTop: vars.space.xs,
    height: '3.4375rem',
    iconDisplay: 'none',
  }),
});

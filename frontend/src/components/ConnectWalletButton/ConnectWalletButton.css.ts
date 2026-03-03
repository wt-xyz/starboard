import { fallbackVar, style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';
import { connectWalletThemeVars } from './vars.css';

export const walletButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.375rem',
  height: fallbackVar(connectWalletThemeVars.height, '2.5rem'),
  padding: '0 1rem',
  width: fallbackVar(connectWalletThemeVars.width, 'auto'),
  marginTop: fallbackVar(connectWalletThemeVars.marginTop, '0px'),
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  borderRadius: vars.radius.button,
  border: 'none',
  fontSize: '0.875em',
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  transition: vars.transition.normal,
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
  height: fallbackVar(connectWalletThemeVars.height, '2.5rem'),
  padding: '0 0.75rem 0 0.5rem',
  width: fallbackVar(connectWalletThemeVars.width, 'auto'),
  marginTop: fallbackVar(connectWalletThemeVars.marginTop, '0px'),
  backgroundColor: vars.color.surfaceElevated,
  color: vars.color.textPrimary,
  borderRadius: vars.radius.button,
  border: 'none',
  fontSize: '0.875em',
  fontWeight: vars.fontWeight.normal,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  position: 'relative',
  transition: vars.transition.normal,
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

export const walletIcon = style({
  display: fallbackVar(connectWalletThemeVars.iconDisplay, 'inline-block'),
  width: '1.25rem',
  height: '1.25rem',
  backgroundColor: 'currentColor',
  maskImage: 'url(/icons/wallet.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
  flexShrink: 0,
});

import { keyframes, style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const dialogContent = style({
  padding: '1.25rem',
  maxWidth: '400px',
  width: '100%',
});

export const addressRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  backgroundColor: vars.color.inputBg,
  borderRadius: '0.75rem',
  marginBottom: '1.5rem',
});

export const avatar = style({
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '50%',
  flexShrink: 0,
});

export const addressText = style({
  flex: 1,
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
});

export const copyButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: '0.375rem',
  backgroundColor: 'transparent',
  border: 'none',
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    color: vars.color.textPrimary,
  },
});

export const copyIcon = style({
  width: '1rem',
  height: '1rem',
});

export const balanceSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  marginBottom: '1.5rem',
});

export const balanceRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const balanceLabel = style({
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
});

export const balanceValue = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
});

export const balanceSymbol = style({
  color: vars.color.textSecondary,
});

export const divider = style({
  height: '1px',
  backgroundColor: vars.color.borderDefault,
  margin: '0.5rem 0',
});

export const disconnectButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: '100%',
  height: '2.75rem',
  backgroundColor: 'transparent',
  color: vars.color.error,
  borderRadius: '0.5rem',
  border: `1px solid ${vars.color.error}`,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: alpha(vars.color.error, 10),
  },
});

const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const skeleton = style({
  height: '1rem',
  width: '4rem',
  backgroundColor: vars.color.surfaceHover,
  borderRadius: '0.25rem',
  animation: `${pulseAnimation} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
});

// Burner Wallet section (dev / in-browser wallet)
export const burnerSection = style({
  marginBottom: '1.5rem',
  padding: '0.75rem',
  backgroundColor: alpha(vars.color.primary, 10),
  borderRadius: '0.75rem',
  border: `1px solid ${alpha(vars.color.primary, 30)}`,
});

export const burnerNotice = style({
  fontSize: '0.8125rem',
  color: vars.color.textSecondary,
  lineHeight: 1.4,
  marginBottom: '0.75rem',
});

export const burnerMintButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '2.5rem',
  padding: '0 1rem',
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
  ':disabled': {
    backgroundColor: vars.color.surfaceDisabled,
    color: vars.color.textDisabled,
    cursor: 'not-allowed',
  },
});

export const getTestnetEthSection = style({
  marginBottom: '1.5rem',
});

export const getTestnetEthButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '2.5rem',
  padding: '0 1rem',
  backgroundColor: 'transparent',
  color: vars.color.textPrimary,
  borderRadius: '0.5rem',
  border: `1px solid ${vars.color.borderStrong}`,
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.borderStrong,
  },
  ':disabled': {
    color: vars.color.textDisabled,
    borderColor: vars.color.borderDefault,
    cursor: 'not-allowed',
  },
});

// Advanced panel (collapsible; contains fund faucet)
export const advancedPanel = style({
  marginBottom: '1.5rem',
  borderRadius: '0.75rem',
  border: `1px solid ${vars.color.borderDefault}`,
  overflow: 'hidden',
});

export const advancedTrigger = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: vars.color.inputBg,
  border: 'none',
  color: vars.color.textSecondary,
  fontSize: '0.8125rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    color: vars.color.textPrimary,
  },
});

export const advancedChevron = style({
  width: '1rem',
  height: '1rem',
  flexShrink: 0,
  transition: 'transform 0.2s',
});

// Fund faucet applet (deploy/fund predicate with web wallet)
export const fundFaucetSection = style({
  padding: '0.75rem 1rem',
  paddingTop: 0,
  backgroundColor: vars.color.inputBg,
  borderTop: `1px solid ${vars.color.borderDefault}`,
});

export const fundFaucetTitle = style({
  fontSize: '0.8125rem',
  fontWeight: '600',
  color: vars.color.textSecondary,
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
});

export const fundFaucetAddressRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.75rem',
});

export const fundFaucetAddressText = style({
  flex: 1,
  fontSize: '0.8125rem',
  color: vars.color.textPrimary,
  wordBreak: 'break-all',
});

export const fundFaucetAmountInput = style({
  width: '100%',
  height: '2.25rem',
  padding: '0 0.5rem',
  marginBottom: '0.5rem',
  backgroundColor: vars.color.inputBg,
  border: `1px solid ${vars.color.inputBg}`,
  borderRadius: '0.375rem',
  color: vars.color.textPrimary,
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.surfaceHover,
  },
  ':focus': {
    outline: 'none',
    borderColor: vars.color.focusRing,
  },
});

export const fundFaucetButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '2.25rem',
  backgroundColor: vars.color.primary,
  color: vars.color.textPrimary,
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
  ':disabled': {
    backgroundColor: vars.color.surfaceDisabled,
    color: vars.color.textDisabled,
    cursor: 'not-allowed',
  },
});

import { keyframes, style } from '@vanilla-extract/css';
import { colors } from '../../../../../styles/colors';

export const addressRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem',
  backgroundColor: colors.slateGrey,
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
  color: colors.snow,
  fontFamily: 'monospace',
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
  color: colors.dustyGrey,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: colors.whiteAlpha[10],
    color: colors.snow,
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
  color: colors.dustyGrey,
});

export const balanceValue = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.snow,
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
});

export const balanceSymbol = style({
  color: colors.dustyGrey,
});

export const divider = style({
  height: '1px',
  backgroundColor: colors.whiteAlpha[10],
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
  color: colors.error,
  borderRadius: '0.5rem',
  border: `1px solid ${colors.error}`,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const skeleton = style({
  height: '1rem',
  width: '4rem',
  backgroundColor: colors.whiteAlpha[10],
  borderRadius: '0.25rem',
  animation: `${pulseAnimation} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
});

// Burner Wallet section (dev / in-browser wallet)
export const burnerSection = style({
  marginBottom: '1.5rem',
  padding: '0.75rem',
  backgroundColor: colors.liquidLavaAlpha[10],
  borderRadius: '0.75rem',
  border: `1px solid ${colors.liquidLavaAlpha[30]}`,
});

export const burnerNotice = style({
  fontSize: '0.8125rem',
  color: colors.dustyGrey,
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
  backgroundColor: colors.liquidLava,
  color: colors.snow,
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: '#E05D0A',
  },
  ':disabled': {
    opacity: 0.6,
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
  color: colors.snow,
  borderRadius: '0.5rem',
  border: `1px solid ${colors.whiteAlpha[20]}`,
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: colors.whiteAlpha[10],
    borderColor: colors.whiteAlpha[30],
  },
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

// Advanced panel (collapsible; contains fund faucet)
export const advancedPanel = style({
  marginBottom: '1.5rem',
  borderRadius: '0.75rem',
  border: `1px solid ${colors.whiteAlpha[10]}`,
  overflow: 'hidden',
});

export const advancedTrigger = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: colors.slateGrey,
  border: 'none',
  color: colors.dustyGrey,
  fontSize: '0.8125rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  ':hover': {
    backgroundColor: colors.whiteAlpha[10],
    color: colors.snow,
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
  backgroundColor: colors.slateGrey,
  borderTop: `1px solid ${colors.whiteAlpha[10]}`,
});

export const fundFaucetTitle = style({
  fontSize: '0.8125rem',
  fontWeight: '600',
  color: colors.dustyGrey,
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
  fontFamily: 'monospace',
  color: colors.snow,
  wordBreak: 'break-all',
});

export const fundFaucetAmountInput = style({
  width: '100%',
  height: '2.25rem',
  padding: '0 0.5rem',
  marginBottom: '0.5rem',
  backgroundColor: colors.gluonGrey,
  border: `1px solid ${colors.whiteAlpha[20]}`,
  borderRadius: '0.375rem',
  color: colors.snow,
  fontSize: '0.875rem',
  ':focus': {
    outline: 'none',
    borderColor: colors.whiteAlpha[30],
  },
});

export const fundFaucetButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '2.25rem',
  backgroundColor: colors.liquidLava,
  color: colors.snow,
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: '#E05D0A',
  },
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

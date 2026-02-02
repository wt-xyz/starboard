import { style } from '@vanilla-extract/css';
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

export const skeleton = style({
  height: '1rem',
  width: '4rem',
  backgroundColor: colors.whiteAlpha[10],
  borderRadius: '0.25rem',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  '@keyframes': {
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },
});

import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const container = style({
  marginTop: '0.5rem',
  borderTop: `1px solid ${colors.whiteAlpha[10]}`,
  paddingTop: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
});

export const row = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const label = style({
  fontSize: '0.75rem',
  color: colors.dustyGrey,
});

export const value = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: colors.snow,
  fontFamily: 'monospace',
});

export const slippageRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
});

export const slippageButton = style({
  fontSize: '0.625rem',
  padding: '1px 6px',
  border: `1px solid ${colors.whiteAlpha[10]}`,
  borderRadius: '4px',
  color: colors.dustyGrey,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&[data-active="true"]': {
      borderColor: colors.liquidLava,
      color: colors.snow,
    },
  },
});

export const slippageInput = style({
  width: '4ch',
  background: colors.slateGrey,
  border: `1px solid ${colors.whiteAlpha[20]}`,
  borderRadius: '4px',
  color: colors.snow,
  fontSize: '0.625rem',
  padding: '1px 4px',
  fontFamily: 'monospace',
  textAlign: 'right',
  outline: 'none',
});

export const slippageSuffix = style({
  fontSize: '0.625rem',
  color: colors.dustyGrey,
});

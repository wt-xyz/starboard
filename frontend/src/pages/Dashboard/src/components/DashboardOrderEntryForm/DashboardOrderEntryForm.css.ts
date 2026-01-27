import { style } from '@vanilla-extract/css';
import { colors } from '../../../../../styles/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  width: '100%',
});

export const connectWalletButton = style({
  marginTop: "20px",
  width: '100%',
  padding: '0.5rem 1.25rem',
  backgroundColor: colors.liquidLava,
  color: colors.snow,
  borderRadius: '0.375rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  ':hover': {
    backgroundColor: '#E05D0A', // Slightly darker Liquid Lava
  },
});

export const connectWalletMessage = style({
  marginTop: '0.75rem',
  display: 'block',
});

import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const walletButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '2.5rem',
  padding: '0 1.25rem',
  backgroundColor: colors.liquidLava,
  color: colors.snow,
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  ':hover': {
    backgroundColor: '#E05D0A', // Slightly darker Liquid Lava
  },
});

export const walletConnected = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  height: '2.5rem',
  padding: '0 0.75rem 0 0.5rem',
  backgroundColor: colors.gluonGrey,
  color: colors.snow,
  borderRadius: '9999px',
  border: `1px solid ${colors.whiteAlpha[20]}`,
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  position: 'relative',
  transition: 'all 0.15s',
  ':hover': {
    backgroundColor: colors.slateGrey,
    borderColor: colors.whiteAlpha[30],
  },
});

export const walletAvatar = style({
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  flexShrink: 0,
});

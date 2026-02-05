import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const button = style({
  flex: 1,
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  backgroundColor: colors.liquidLava,
  color: colors.snow,
  ':hover': {
    backgroundColor: '#E05D0A',
  },
  ':active': {
    backgroundColor: '#CC5209',
  },
});

export const disabled = style({
  opacity: 0.5,
  cursor: 'not-allowed',
  ':hover': {
    backgroundColor: colors.liquidLava,
  },
});

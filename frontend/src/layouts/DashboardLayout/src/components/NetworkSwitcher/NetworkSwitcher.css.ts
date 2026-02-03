import { colors } from '@/styles/colors';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const label = style({
  fontSize: '0.75rem',
  color: colors.dustyGrey,
  textTransform: 'uppercase',
  fontWeight: '600',
  letterSpacing: '0.05em',
});

export const select = style({
  padding: '0.5rem 2rem 0.5rem 0.75rem',
  backgroundColor: colors.slateGrey,
  color: colors.snow,
  border: `1px solid ${colors.whiteAlpha[20]}`,
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.15s',
  minWidth: '8rem',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FBFBFB' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
  backgroundSize: '12px',
  ':hover': {
    backgroundColor: colors.gluonGrey,
    borderColor: colors.whiteAlpha[30],
  },
  ':focus': {
    outline: 'none',
    borderColor: colors.liquidLava,
    boxShadow: `0 0 0 2px ${colors.liquidLavaAlpha[20]}`,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

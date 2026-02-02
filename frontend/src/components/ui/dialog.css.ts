import { keyframes, style } from '@vanilla-extract/css';
import { colors } from '../../styles/colors';

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const fadeOut = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const scaleIn = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

const scaleOut = keyframes({
  '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
  '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} 0.2s ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} 0.15s ease-in`,
    },
  },
});

export const content = style({
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '400px',
  maxHeight: '85vh',
  backgroundColor: colors.gluonGrey,
  borderRadius: '1rem',
  border: `1px solid ${colors.whiteAlpha[10]}`,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden',
  selectors: {
    '&[data-state="open"]': {
      animation: `${scaleIn} 0.2s ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${scaleOut} 0.15s ease-in`,
    },
  },
  '@media': {
    '(max-width: 480px)': {
      maxWidth: 'calc(100% - 2rem)',
      margin: '0 1rem',
    },
  },
});

export const close = style({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  borderRadius: '0.375rem',
  opacity: 0.7,
  transition: 'all 0.15s',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.375rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.dustyGrey,
  ':hover': {
    opacity: 1,
    backgroundColor: colors.whiteAlpha[10],
    color: colors.snow,
  },
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '1.25rem 1.25rem 0',
});

export const title = style({
  color: colors.snow,
  fontSize: '1.125rem',
  fontWeight: 600,
  margin: 0,
});

export const description = style({
  color: colors.dustyGrey,
  fontSize: '0.875rem',
  margin: 0,
});

export const body = style({
  padding: '1.25rem',
  overflowY: 'auto',
});

export const footer = style({
  padding: '0 1.25rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
});

export const icon = style({
  width: '1rem',
  height: '1rem',
});

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

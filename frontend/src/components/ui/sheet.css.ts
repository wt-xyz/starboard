import { keyframes, style } from '@vanilla-extract/css';
import { alpha } from '../../styles/alpha';
import { vars } from '../../styles/theme.contract.css';

// Animation keyframes
const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const fadeOut = keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const slideInFromRight = keyframes({
  '0%': { transform: 'translateX(100%)' },
  '100%': { transform: 'translateX(0)' },
});

const slideOutToRight = keyframes({
  '0%': { transform: 'translateX(0)' },
  '100%': { transform: 'translateX(100%)' },
});

const slideInFromLeft = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(0)' },
});

const slideOutToLeft = keyframes({
  '0%': { transform: 'translateX(0)' },
  '100%': { transform: 'translateX(-100%)' },
});

const slideInFromTop = keyframes({
  '0%': { transform: 'translateY(-100%)' },
  '100%': { transform: 'translateY(0)' },
});

const slideOutToTop = keyframes({
  '0%': { transform: 'translateY(0)' },
  '100%': { transform: 'translateY(-100%)' },
});

const slideInFromBottom = keyframes({
  '0%': { transform: 'translateY(100%)' },
  '100%': { transform: 'translateY(0)' },
});

const slideOutToBottom = keyframes({
  '0%': { transform: 'translateY(0)' },
  '100%': { transform: 'translateY(100%)' },
});

// Overlay styles
export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: vars.color.overlay,
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} 0.2s ease-out`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} 0.15s ease-in`,
    },
  },
});

// Base content styles
const contentBase = style({
  position: 'fixed',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  transition: 'ease-in-out',
  backgroundColor: vars.color.cardBg,
  selectors: {
    '&[data-state="open"]': {
      animationDuration: '0.2s',
    },
    '&[data-state="closed"]': {
      animationDuration: '0.15s',
    },
  },
});

// Side-specific content styles
export const contentRight = style([
  contentBase,
  {
    top: 0,
    bottom: 0,
    right: 0,
    height: '100%',
    width: '75%',
    maxWidth: '24rem',
    borderLeft: `1px solid ${vars.color.borderDefault}`,
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromRight} 0.2s ease-out`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToRight} 0.15s ease-in`,
      },
    },
    '@media': {
      '(min-width: 640px)': {
        maxWidth: '24rem',
      },
    },
  },
]);

export const contentLeft = style([
  contentBase,
  {
    top: 0,
    bottom: 0,
    left: 0,
    height: '100%',
    width: '75%',
    maxWidth: '24rem',
    borderRight: `1px solid ${vars.color.borderDefault}`,
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromLeft} 0.2s ease-out`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToLeft} 0.15s ease-in`,
      },
    },
    '@media': {
      '(min-width: 640px)': {
        maxWidth: '24rem',
      },
    },
  },
]);

export const contentTop = style([
  contentBase,
  {
    left: 0,
    right: 0,
    top: 0,
    height: 'auto',
    borderBottom: `1px solid ${vars.color.borderDefault}`,
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromTop} 0.2s ease-out`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToTop} 0.15s ease-in`,
      },
    },
  },
]);

export const contentBottom = style([
  contentBase,
  {
    left: 0,
    right: 0,
    bottom: 0,
    height: '80vh',
    maxHeight: '80vh',
    borderTop: `1px solid ${vars.color.borderDefault}`,
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideInFromBottom} 0.2s ease-out`,
      },
      '&[data-state="closed"]': {
        animation: `${slideOutToBottom} 0.15s ease-in`,
      },
    },
  },
]);

// Close button styles
export const close = style({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  borderRadius: '0.5rem',
  opacity: 0.7,
  transition: 'opacity 0.2s',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    opacity: 1,
  },
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${alpha(vars.color.focusRing, 50)}`,
    backgroundColor: vars.color.surfaceHover,
  },
  selectors: {
    '&[data-state="open"]': {
      backgroundColor: vars.color.surfaceHover,
    },
    '&:disabled': {
      pointerEvents: 'none',
    },
  },
});

// Header styles
export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
  padding: '1rem',
});

// Footer styles
export const footer = style({
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1rem',
});

// Title styles
export const title = style({
  color: vars.color.textPrimary,
  fontWeight: 600,
});

// Description styles
export const description = style({
  color: vars.color.textSecondary,
  fontSize: '0.875rem',
});

// Icon size styles
export const icon = style({
  width: '1rem',
  height: '1rem',
});

// Screen reader only styles
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

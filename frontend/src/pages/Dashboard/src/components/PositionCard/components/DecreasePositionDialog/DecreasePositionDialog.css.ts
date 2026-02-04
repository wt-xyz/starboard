import { keyframes, style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const dialogContent = style({
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.75rem',
  padding: '1.5rem',
  border: `1px solid ${colors.whiteAlpha[10]}`,
  maxWidth: '420px',
  width: '100%',
});

export const dialogTitle = style({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: colors.snow,
  marginBottom: '1rem',
});

export const tabsList = style({
  display: 'flex',
  gap: '0.25rem',
  marginBottom: '1.5rem',
  padding: '0.25rem',
  backgroundColor: colors.slateGrey,
  borderRadius: '0.5rem',
});

export const tabsTrigger = style({
  flex: 1,
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.whiteAlpha[30],
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  transition: 'all 0.15s ease',

  selectors: {
    '&[data-state="active"]': {
      backgroundColor: colors.gluonGrey,
      color: colors.snow,
    },
    '&:hover:not([data-state="active"])': {
      color: colors.snow,
    },
  },
});

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

export const tabsContent = style({
  outline: 'none',
  display: 'grid',
  gridTemplateRows: '0fr',
  transition: 'grid-template-rows 0.2s ease-out, opacity 0.15s ease-out',
  opacity: 0,

  selectors: {
    '&[data-state="active"]': {
      gridTemplateRows: '1fr',
      opacity: 1,
      animation: `${fadeIn} 0.15s ease-out`,
    },
  },
});

export const tabsContentInner = style({
  overflow: 'hidden',
});

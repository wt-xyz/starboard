import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const page = style({
  width: '100%',
  height: 'calc(100vh - 6rem)',
  backgroundColor: vars.color.pageBg,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 420px',
  gridTemplateRows: 'auto 1fr',
  gap: vars.space.sm,
  padding: vars.space.sm,
  boxSizing: 'border-box',
  overflow: 'hidden',
  '@media': {
    '(max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto auto auto',
      padding: '0',
      paddingBottom: '80px',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
  },
});

export const mobileHeader = style({
  display: 'none',
  '@media': {
    '(max-width: 1024px)': {
      display: 'block',
    },
  },
});

export const chartSection = style({
  minWidth: 0,
  minHeight: '360px',
  maxHeight: 'calc(100vh - 6.5rem - 280px)',
  height: 'calc(100vh - 6.5rem - 440px)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: vars.color.cardBg,
  borderRadius: vars.radius.card,
  overflow: 'auto',
  position: 'relative',
  resize: 'vertical',
  '@media': {
    '(max-width: 1024px)': {
      resize: 'none',
      height: 'auto',
      minHeight: '460px',
      maxHeight: 'none',
    },
    '(min-height: 1080px)': {
      minHeight: '420px',
    },
    '(min-height: 1440px)': {
      minHeight: '540px',
    },
  },
});

export const orderEntrySection = style({
  gridRow: '1 / -1',
  gridColumn: 2,
  contain: 'size',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  boxSizing: 'border-box',
  '@media': {
    '(max-width: 1024px)': {
      display: 'none',
    },
  },
});

export const bottomSection = style({
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '@media': {
    '(max-width: 1024px)': {
      overflow: 'visible',
    },
  },
});

export const orderEntryFormWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

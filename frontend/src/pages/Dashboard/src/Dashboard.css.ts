import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const page = style({
  width: '100%',
  minHeight: 'calc(100vh - 6rem)',
  backgroundColor: vars.color.pageBg,
  display: 'flex',
  flexDirection: 'row',
  gap: vars.space.sm,
  padding: vars.space.sm,
  boxSizing: 'border-box',
  overflowX: 'hidden',
  '@media': {
    '(max-width: 1024px)': {
      flexDirection: 'column',
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

export const leftColumn = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

export const chartSection = style({
  flex: 'none',
  minWidth: 0,
  height: '540px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: vars.color.cardBg,
  borderRadius: vars.radius.card,
  overflow: 'auto',
  position: 'relative',
  resize: 'vertical',
  '@media': {
    '(min-width: 2560px)': {
      height: '780px',
    },
    '(min-width: 3840px)': {
      height: '1140px',
    },
    '(max-width: 1024px)': {
      resize: 'none',
      height: 'auto',
      minHeight: '460px',
    },
  },
});

export const orderEntrySection = style({
  flexShrink: 0,
  width: '420px',
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
  flex: 1,
  minWidth: 0,
  minHeight: '240px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  '@media': {
    '(max-width: 1024px)': {
      flex: 'none',
      minHeight: '0',
      height: 'auto',
      overflow: 'visible',
    },
  },
});

export const orderEntryFormWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

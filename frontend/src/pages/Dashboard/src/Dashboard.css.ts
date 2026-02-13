import { style } from '@vanilla-extract/css';
import { colors } from '../../../styles/colors';

export const page = style({
  width: '100%',
  height: 'calc(100vh - 4rem)',
  backgroundColor: colors.darkVoid,
  display: 'grid',
  gridTemplateColumns: '1fr 400px',
  gridTemplateRows: 'auto 1fr',
  gap: '0.5rem',
  padding: '1rem 1rem 0.5rem 1rem',
  '@media': {
    '(max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto auto auto',
      padding: '0.5rem',
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
  minHeight: '460px',
  maxHeight: 'calc(100vh - 6rem - 150px)',
  height: 'calc(100vh - 6rem - 280px)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.5rem',
  overflow: 'hidden',
  position: 'relative',
  resize: 'vertical',
  '@media': {
    '(max-width: 1024px)': {
      resize: 'none',
      height: 'auto',
      minHeight: '460px',
      maxHeight: 'none',
    },
  },
});

export const orderEntrySection = style({
  contain: 'size',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.5rem',
  padding: '1rem',
  boxSizing: 'border-box',
  '@media': {
    '(max-width: 1024px)': {
      display: 'none',
    },
  },
});

export const bottomSection = style({
  gridColumn: '1 / -1',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  '@media': {
    '(max-width: 1024px)': {
      overflow: 'visible',
    },
  },
});

export const orderEntryFormWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const orderEntryTitle = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.snow,
  marginBottom: '1rem',
  textTransform: 'none',
  letterSpacing: '0.01em',
});

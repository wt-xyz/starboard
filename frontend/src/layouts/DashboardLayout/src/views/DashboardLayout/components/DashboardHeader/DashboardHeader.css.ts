import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const header = style({
  backgroundColor: colors.gluonGrey,
  borderBottom: `1px solid ${colors.slateGrey}`,
  padding: '0 2rem',
  height: '4rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  '@media': {
    '(max-width: 1024px)': {
      padding: '0 1rem',
    },
  },
});

export const headerLeft = style({
  display: 'flex',
  minWidth: 'fit-content',
  gap: '2rem',
  alignItems: 'center',
});

export const statsSection = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  overflow: 'auto',
  marginLeft: '1.5rem',
  paddingLeft: '1.5rem',
  borderLeft: `1px solid ${colors.slateGrey}`,
});

export const logo = style({
  height: '2rem',
  width: 'auto',
  objectFit: 'contain',
  display: 'block',
});

export const headerRight = style({
  width: 'fit-content',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export { desktopOnly } from '@/styles/desktopOnly.css';
export { mobileOnly } from '@/styles/mobileOnly.css';

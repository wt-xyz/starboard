import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const header = style({
  backgroundColor: vars.color.pageBg,
  padding: `0 ${vars.space.lg}`,
  height: '3rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  '@media': {
    '(max-width: 1024px)': {
      padding: `0 ${vars.space.lg}`,
    },
  },
});

export const headerLeft = style({
  display: 'flex',
  minWidth: 'fit-content',
  gap: vars.space.lg,
  alignItems: 'center',
});

export const statsSection = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.lg,
  overflow: 'auto',
  marginLeft: vars.space.lg,
  paddingLeft: vars.space.lg,
  borderLeft: `1px solid ${vars.color.borderDefault}`,
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
  gap: vars.space.sm,
});

export { desktopOnly } from '@/styles/desktopOnly.css';
export { mobileOnly } from '@/styles/mobileOnly.css';

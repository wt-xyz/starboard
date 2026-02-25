import { globalStyle, style } from '@vanilla-extract/css';

export const desktopOnly = style({
  display: 'contents',
});

globalStyle(`html .${desktopOnly}`, {
  '@media': {
    '(max-width: 1024px)': {
      display: 'none',
    },
  },
});

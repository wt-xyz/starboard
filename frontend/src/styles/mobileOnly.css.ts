import { globalStyle, style } from '@vanilla-extract/css';

export const mobileOnly = style({
  display: 'none',
});

globalStyle(`html .${mobileOnly}`, {
  '@media': {
    '(max-width: 1024px)': {
      display: 'contents',
    },
  },
});

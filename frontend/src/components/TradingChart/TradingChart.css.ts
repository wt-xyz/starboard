import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',
  position: 'relative',
  flex: 1,
  '@media': {
    '(max-width: 1024px)': {},
  },
});

import { globalStyle } from '@vanilla-extract/css';
import { colors } from './colors';

globalStyle('*::-webkit-scrollbar', {
  width: '8px',
  height: '8px',
});

globalStyle('*::-webkit-scrollbar-track', {
  background: 'transparent',
});

globalStyle('*::-webkit-scrollbar-thumb', {
  background: colors.dustyGreyAlpha[50],
  borderRadius: '4px',
});

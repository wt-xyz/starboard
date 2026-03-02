import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

globalStyle(':root', {
  fontFamily: vars.font.body,
  fontVariantNumeric: 'tabular-nums lining-nums',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle(':focus-visible:not(input):not(textarea):not(select)', {
  outline: `${vars.focus.ringWidth} solid ${vars.color.focusRing}`,
  outlineOffset: vars.focus.ringOffset,
});

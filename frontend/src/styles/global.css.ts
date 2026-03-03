import { globalFontFace, globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

globalFontFace('Neurial Grotesk', {
  src: 'url("/fonts/NeurialGrotesk-Regular.woff2") format("woff2")',
  fontWeight: 'normal',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalStyle(':root', {
  fontFamily: vars.font.body,
  fontVariantNumeric: 'tabular-nums lining-nums',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
});

globalStyle('button, input, select, textarea', {
  fontFamily: 'inherit',
});

globalStyle('h1, h2, h3', {
  fontFamily: vars.font.display,
});

globalStyle(':focus-visible:not(input):not(textarea):not(select)', {
  outline: `${vars.focus.ringWidth} solid ${vars.color.focusRing}`,
  outlineOffset: vars.focus.ringOffset,
});

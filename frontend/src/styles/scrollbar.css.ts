import { globalStyle } from '@vanilla-extract/css';
import { alpha } from './alpha';
import { vars } from './theme.contract.css';

globalStyle('*::-webkit-scrollbar', {
  width: '8px',
  height: '8px',
});

globalStyle('*::-webkit-scrollbar-track', {
  background: 'transparent',
});

globalStyle('*::-webkit-scrollbar-thumb', {
  background: alpha(vars.color.textSecondary, 50),
  borderRadius: '4px',
});

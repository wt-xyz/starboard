import { style } from '@vanilla-extract/css';
import { colors } from '../../../../../styles/colors';

export const page = style({
  minHeight: '100vh',
  background: colors.darkVoid,
  display: 'flex',
  flexDirection: 'column',
});

export const container = style({
  flex: 1,
  width: '100%',
  maxWidth: '100%',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
});

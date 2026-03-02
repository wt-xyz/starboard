import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';
import * as $base from './common/Cell.css';

export const cellSecondary = $base.cellSecondary;

export const positive = style({
  color: vars.color.success,
});

export const negative = style({
  color: vars.color.error,
});

export const muted = style({
  color: vars.color.textSecondary,
});

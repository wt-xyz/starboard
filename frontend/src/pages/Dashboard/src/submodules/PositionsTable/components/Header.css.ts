import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const headerRow = style({
  backgroundColor: vars.color.cardBg,
});

export const headerCell = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  padding: '0.625rem 0.625rem 0.5rem 0.625rem',
  textAlign: 'left',
  fontSize: '0.6875rem',
  fontWeight: '500',
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  backgroundColor: vars.color.cardBg,
});

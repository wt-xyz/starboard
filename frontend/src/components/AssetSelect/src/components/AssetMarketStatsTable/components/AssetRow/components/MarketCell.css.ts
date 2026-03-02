import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const marketCell = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const assetIcon = style({
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  flexShrink: 0,
  objectFit: 'cover',
});

export const assetName = style({
  fontFamily: 'inherit',
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: vars.color.textPrimary,
});

export const leverageBadge = style({
  fontSize: '0.625rem',
  fontWeight: 500,
  color: vars.color.textSecondary,
  backgroundColor: vars.color.surfaceHover,
  padding: '0.0625rem 0.3125rem',
  borderRadius: '0.25rem',
  lineHeight: 1.4,
});

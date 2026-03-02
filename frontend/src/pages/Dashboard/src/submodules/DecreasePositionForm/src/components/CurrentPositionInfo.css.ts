import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const positionInfo = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem',
  backgroundColor: vars.color.inputBg,
  borderRadius: '0.5rem',
  marginBottom: '1.5rem',
});

export const positionInfoLabel = style({
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
  marginBottom: '0.25rem',
});

export const positionInfoValue = style({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
});

export const positionInfoValueSecondary = style({
  fontSize: '0.6875rem',
  color: vars.color.textSecondary,
  marginTop: '0.125rem',
});

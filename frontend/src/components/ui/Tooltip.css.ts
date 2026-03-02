import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

const fadeIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

export const content = style({
  backgroundColor: vars.color.surfaceElevated,
  color: vars.color.textPrimary,
  border: `1px solid ${vars.color.borderDefault}`,
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  fontSize: vars.fontSize.bodySm,
  lineHeight: '1.4',
  maxWidth: '280px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  animation: `${fadeIn} 0.15s ease-out`,
  zIndex: 1100,
});

export const arrow = style({
  fill: vars.color.surfaceElevated,
});

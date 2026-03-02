import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const sliderHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.75rem',
});

export const sliderLabel = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: vars.color.textSecondary,
});

export const sliderValue = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: vars.color.primary,
});

export const sliderRoot = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '20px',
  marginBottom: '0.5rem',
  touchAction: 'none',
  userSelect: 'none',
});

export const sliderTrack = style({
  position: 'relative',
  flexGrow: 1,
  height: '6px',
  backgroundColor: vars.color.inputBg,
  borderRadius: '3px',
});

export const sliderRange = style({
  position: 'absolute',
  height: '100%',
  backgroundColor: vars.color.primary,
  borderRadius: '3px',
});

export const sliderThumb = style({
  display: 'block',
  width: '18px',
  height: '18px',
  backgroundColor: vars.color.textPrimary,
  borderRadius: '50%',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.1s, box-shadow 0.15s',
  ':hover': {
    transform: 'scale(1.1)',
  },
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 4px ${alpha(vars.color.primary, 30)}`,
  },
});

export const percentageMarks = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '0.25rem',
});

export const percentageMark = style({
  padding: '0.25rem 0.5rem',
  backgroundColor: vars.color.inputBg,
  color: vars.color.textSecondary,
  border: `1px solid ${vars.color.inputBg}`,
  borderRadius: '0.25rem',
  fontSize: '0.625rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.surfaceHover,
  },
  ':active': {
    color: vars.color.primary,
    borderColor: vars.color.primary,
  },
});

export const percentageMarkActive = style({
  color: vars.color.primary,
  borderColor: vars.color.primary,
  backgroundColor: alpha(vars.color.primary, 10),
});

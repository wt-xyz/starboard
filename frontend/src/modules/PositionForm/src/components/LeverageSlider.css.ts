import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const sliderContainer = style({
  marginTop: '0.25rem',
  width: '100%',
  boxSizing: 'border-box',
});

export const sliderRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const sliderColumn = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const trackWrapper = style({
  position: 'relative',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
});

const trackDotBase = {
  position: 'absolute',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1,
  pointerEvents: 'none',
} as const;

export const trackDotActive = style({
  ...trackDotBase,
  backgroundColor: vars.color.cardBg,
  border: `2px solid ${vars.color.primary}`,
});

export const trackDotInactive = style({
  ...trackDotBase,
  backgroundColor: vars.color.cardBg,
  border: `2px solid ${vars.color.borderDefault}`,
});

export const sliderRoot = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '20px',
  boxSizing: 'border-box',
  overflow: 'visible',
  zIndex: 2,
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
  border: `2px solid ${vars.color.primary}`,
  boxShadow: `0 0 0 1px ${alpha(vars.color.primary, 20)}`,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: vars.color.textSecondary,
  },
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${alpha(vars.color.primary, 25)}`,
  },
});

export const labelsRow = style({
  position: 'relative',
  height: '1rem',
  marginTop: '2px',
  width: '100%',
});

export const labelButton = style({
  position: 'absolute',
  padding: 0,
  backgroundColor: 'transparent',
  color: vars.color.textSecondary,
  border: 'none',
  fontSize: vars.fontSize.label,
  cursor: 'pointer',
  transition: 'color 0.15s',
  whiteSpace: 'nowrap',
  transform: 'translateX(-50%)',
  ':hover': {
    color: vars.color.textPrimary,
  },
  ':active': {
    color: vars.color.primary,
  },
});

export const labelButtonFirst = style({
  transform: 'translateX(0) !important',
});

export const labelButtonLast = style({
  transform: 'translateX(-100%) !important',
});

export const leverageInputWrapper = style({
  display: 'flex',
  alignItems: 'center',
  gap: '1px',
  flexShrink: 0,
  backgroundColor: vars.color.inputBg,
  border: `1px solid ${vars.color.inputBg}`,
  borderRadius: '0.5rem',
  padding: '6px 8px',
  transition: 'all 0.2s',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceHover,
      borderColor: vars.color.surfaceHover,
    },
    '&:focus-within': {
      borderColor: vars.color.focusRing,
    },
  },
});

export const leverageInput = style({
  width: '3ch',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.body,
  fontWeight: 500,
  textAlign: 'right',
});

export const leverageSuffix = style({
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.body,
  fontWeight: 500,
});

export const error = style({
  color: vars.color.error,
  fontSize: vars.fontSize.caption,
  marginBottom: '0.25rem',
});

import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

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
  backgroundColor: colors.gluonGrey,
  border: `2px solid ${colors.liquidLava}`,
});

export const trackDotInactive = style({
  ...trackDotBase,
  backgroundColor: colors.gluonGrey,
  border: `2px solid ${colors.slateGrey}`,
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
  height: '4px',
  backgroundColor: colors.slateGrey,
  borderRadius: '2px',
});

export const sliderRange = style({
  position: 'absolute',
  height: '100%',
  backgroundColor: colors.liquidLava,
  borderRadius: '2px',
});

export const sliderThumb = style({
  display: 'block',
  width: '18px',
  height: '18px',
  backgroundColor: colors.snow,
  borderRadius: '50%',
  border: `3px solid ${colors.liquidLava}`,
  boxShadow: `0 0 0 2px ${colors.liquidLavaAlpha[30]}`,
  cursor: 'pointer',
  ':hover': {
    backgroundColor: colors.dustyGrey,
  },
  ':focus': {
    outline: 'none',
    boxShadow: `0 0 0 4px ${colors.liquidLavaAlpha[30]}`,
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
  color: colors.dustyGrey,
  border: 'none',
  fontSize: '0.625rem',
  cursor: 'pointer',
  transition: 'color 0.15s',
  whiteSpace: 'nowrap',
  transform: 'translateX(-50%)',
  ':hover': {
    color: colors.snow,
  },
  ':active': {
    color: colors.liquidLava,
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
  backgroundColor: colors.slateGrey,
  border: `1px solid ${colors.whiteAlpha[20]}`,
  borderRadius: '6px',
  padding: '6px 8px',
});

export const leverageInput = style({
  width: '3ch',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  color: colors.snow,
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  fontWeight: 600,
  textAlign: 'right',
});

export const leverageSuffix = style({
  color: colors.dustyGrey,
  fontSize: '0.875rem',
  fontWeight: 500,
});

export const error = style({
  color: colors.error,
  fontSize: '0.75rem',
  marginBottom: '0.25rem',
});

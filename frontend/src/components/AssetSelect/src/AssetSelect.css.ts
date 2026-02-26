import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { colors } from '@/styles/colors';

// ── Trigger ──────────────────────────────────────────────────────────────────

export const trigger = style({
  anchorName: '--asset-select',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.375rem 0.625rem',
  borderRadius: '0.375rem',
  border: `1px solid transparent`,
  background: 'transparent',
  color: colors.snow,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
  ':hover': {
    backgroundColor: colors.whiteAlpha[8],
    borderColor: colors.whiteAlpha[10],
  },
});

export const triggerChevron = style({
  fontSize: '0.625rem',
  color: colors.dustyGrey,
  transition: 'transform 0.2s ease',
});

export const assetIcon = style({
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  flexShrink: 0,
  objectFit: 'cover',
});

// ── Popover Root ─────────────────────────────────────────────────────────────

export const rootStyle = recipe({
  base: {
    positionAnchor: '--asset-select',
    top: 'anchor(bottom)',
    margin: 0,
    marginTop: '0.5rem',
    border: 'none',
    background: 'transparent',
    width: '100vw',
    overflow: 'auto',
    '@media': {
      '(max-width: 1024px)': {
        background: colors.gluonGrey,
        overflow: 'hidden',
      },
    },
  },
  variants: {
    fullWidth: {
      true: {
        left: '0',
      },
      false: {
        left: 'anchor(left)',
      },
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

export const popoverScroller = style({
  display: 'block',
  '@media': {
    '(max-width: 1024px)': {
      overflow: 'auto',
      maxHeight: '520px',
    },
  },
});

export const popoverContent = recipe({
  base: {
    backgroundColor: colors.gluonGrey,
    border: `1px solid ${colors.whiteAlpha[10]}`,
    minWidth: 860,
    width: '80%',
    maxWidth: 1200,
    maxHeight: '520px',
    overflow: 'auto',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.2)',
    '@media': {
      '(max-width: 1024px)': {
        overflow: 'visible',
        maxHeight: 'none',
      },
    },
  },
  variants: {
    fullWidth: {
      true: {
        width: '100%',
      },
      false: {
        width: '80%',
      },
    },
  },
});

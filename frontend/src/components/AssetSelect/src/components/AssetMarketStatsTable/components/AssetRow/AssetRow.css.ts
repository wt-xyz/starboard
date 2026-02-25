import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

// ── Row ─────────────────────────────────────────────────────────────────────

export const row = style({
  cursor: 'pointer',
  transition: 'background-color 0.1s ease',
  ':hover': {
    backgroundColor: colors.whiteAlpha[5],
  },
});

export const rowActive = style({
  backgroundColor: colors.whiteAlpha[8],
});

// ── Base Cell ───────────────────────────────────────────────────────────────

export const cell = style({
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: colors.snow,
  fontFamily: 'monospace',
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${colors.whiteAlpha[5]}`,
});

// ── Shared Cell Styles ──────────────────────────────────────────────────────

export const muted = style({
  color: colors.dustyGrey,
});

export const positive = style({
  color: colors.success,
});

export const negative = style({
  color: colors.error,
});

// ── Dual Value (OI / Liquidity) ─────────────────────────────────────────────

export const dualValue = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.625rem',
});

export const longValue = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.1875rem',
  color: colors.success,
});

export const shortValue = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.1875rem',
  color: colors.error,
});

export const dualArrow = style({
  fontSize: '0.5rem',
});

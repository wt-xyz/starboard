import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

// ── Row ─────────────────────────────────────────────────────────────────────

export const row = style({
  cursor: 'pointer',
  transition: 'background-color 0.1s ease',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
  },
  selectors: {
    '&:nth-child(even)': {
      backgroundColor: alpha(vars.color.textPrimary, 3),
    },
    '&:nth-child(even):hover': {
      backgroundColor: vars.color.surfaceHover,
    },
  },
});

export const rowActive = style({});

// ── Base Cell ───────────────────────────────────────────────────────────────

export const cell = style({
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: vars.color.textPrimary,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  whiteSpace: 'nowrap',
});

// ── Shared Cell Styles ──────────────────────────────────────────────────────

export const muted = style({
  color: vars.color.textSecondary,
});

export const positive = style({
  color: vars.color.success,
});

export const negative = style({
  color: vars.color.error,
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
  color: vars.color.success,
});

export const shortValue = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.1875rem',
  color: vars.color.error,
});

export const dualArrow = style({
  fontSize: '0.5rem',
});

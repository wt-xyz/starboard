import { style } from '@vanilla-extract/css';

export const tableWrapper = style({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
});

// ── Column Widths ───────────────────────────────────────────────────────────

export const colStar = style({ width: '2rem' });
export const colMarket = style({ width: '180px' });

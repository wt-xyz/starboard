import { style } from '@vanilla-extract/css';
import { colors } from '../../../../../../styles/colors';

export const card = style({
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.5rem',
  padding: '0.75rem',
  border: `1px solid ${colors.whiteAlpha[10]}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

export const side = style({
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.625rem',
  fontWeight: '700',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
});

export const sideLong = style({
  backgroundColor: 'rgba(34, 197, 94, 0.15)',
  color: colors.success,
});

export const sideShort = style({
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  color: colors.error,
});

export const assetName = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: colors.snow,
});

export const actionLabel = style({
  marginLeft: 'auto',
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.6875rem',
  fontWeight: '600',
  backgroundColor: colors.whiteAlpha[10],
  color: colors.dustyGrey,
});

export const timestamp = style({
  fontSize: '0.6875rem',
  color: colors.dustyGrey,
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.5rem',
  padding: '0.625rem',
  backgroundColor: colors.whiteAlpha[5],
  borderRadius: '0.375rem',
});

export const statItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
});

export const statLabel = style({
  fontSize: '0.6875rem',
  color: colors.dustyGrey,
});

export const statValue = style({
  fontSize: '0.75rem',
  fontWeight: '600',
  color: colors.snow,
  fontFamily: 'monospace',
});

export const pnlPositive = style({
  color: colors.success,
});

export const pnlNegative = style({
  color: colors.error,
});

export const pnlMuted = style({
  color: colors.dustyGrey,
});

import { style } from '@vanilla-extract/css';
import { colors } from '@/styles/colors';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem 0.75rem',
  backgroundColor: colors.gluonGrey,
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  gap: '0.5rem',
});

export const assetSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: '0 0 auto',
});

export const priceSection = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.5rem',
  flex: '0 0 auto',
});

export const price = style({
  fontSize: '1rem',
  fontWeight: '600',
  color: colors.snow,
  fontFamily: 'monospace',
});

export const priceChange = style({
  fontSize: '0.75rem',
  fontWeight: '500',
  fontFamily: 'monospace',
});

export const priceChangePositive = style({
  color: colors.success,
});

export const priceChangeNegative = style({
  color: colors.error,
});

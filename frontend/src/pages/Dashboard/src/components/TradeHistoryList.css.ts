import { style } from '@vanilla-extract/css';
import { colors } from '../../../../styles/colors';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 1rem',
  color: colors.dustyGrey,
  textAlign: 'center',
});

export const emptyStateText = style({
  fontSize: '0.875rem',
  color: colors.dustyGrey,
});

export const historyCard = style({
  backgroundColor: colors.slateGrey,
  borderRadius: '0.5rem',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  border: `1px solid ${colors.whiteAlpha[10]}`,
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const assetInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const assetName = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: colors.snow,
});

export const sideBadge = style({
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.6875rem',
  fontWeight: '600',
  selectors: {
    '&[data-side="LONG"]': {
      backgroundColor: colors.whiteAlpha[10],
      color: colors.success,
    },
    '&[data-side="SHORT"]': {
      backgroundColor: colors.whiteAlpha[10],
      color: colors.error,
    },
  },
});

export const timestamp = style({
  fontSize: '0.6875rem',
  color: colors.dustyGrey,
});

export const pnlRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem',
  backgroundColor: colors.whiteAlpha[5],
  borderRadius: '0.375rem',
});

export const pnlLabel = style({
  fontSize: '0.75rem',
  color: colors.dustyGrey,
});

export const pnlValue = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  fontFamily: 'monospace',
  selectors: {
    '&[data-positive="true"]': {
      color: colors.success,
    },
    '&[data-positive="false"]': {
      color: colors.error,
    },
  },
});

export const statsRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '0.5rem',
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

export const closeBadge = style({
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.6875rem',
  fontWeight: '600',
  backgroundColor: colors.whiteAlpha[10],
  color: colors.dustyGrey,
  selectors: {
    '&[data-liquidated="true"]': {
      backgroundColor: colors.error,
      color: colors.snow,
    },
  },
});

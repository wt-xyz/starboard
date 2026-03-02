import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

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
  minHeight: '8rem',
  color: vars.color.textSecondary,
  textAlign: 'center',
});

export const emptyStateText = style({
  fontSize: vars.fontSize.body,
  color: vars.color.textSecondary,
});

export const historyCard = style({
  backgroundColor: vars.color.inputBg,
  borderRadius: '0.5rem',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  border: `1px solid ${vars.color.borderDefault}`,
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
  fontSize: vars.fontSize.body,
  fontWeight: '500',
  color: vars.color.textPrimary,
});

export const sideBadge = style({
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: vars.fontSize.label,
  fontWeight: '500',
  selectors: {
    '&[data-side="LONG"]': {
      backgroundColor: alpha(vars.color.textPrimary, 10),
      color: vars.color.success,
    },
    '&[data-side="SHORT"]': {
      backgroundColor: alpha(vars.color.textPrimary, 10),
      color: vars.color.error,
    },
  },
});

export const timestamp = style({
  fontSize: vars.fontSize.label,
  color: vars.color.textSecondary,
});

export const pnlRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.5rem',
  backgroundColor: alpha(vars.color.textPrimary, 5),
  borderRadius: '0.375rem',
});

export const pnlLabel = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.textSecondary,
});

export const pnlValue = style({
  fontSize: vars.fontSize.body,
  fontWeight: '500',
  selectors: {
    '&[data-positive="true"]': {
      color: vars.color.success,
    },
    '&[data-positive="false"]': {
      color: vars.color.error,
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
  fontSize: vars.fontSize.label,
  color: vars.color.textSecondary,
});

export const statValue = style({
  fontSize: vars.fontSize.caption,
  fontWeight: '500',
  color: vars.color.textPrimary,
});

export const closeBadge = style({
  padding: '0.125rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: vars.fontSize.label,
  fontWeight: '500',
  backgroundColor: alpha(vars.color.textPrimary, 10),
  color: vars.color.textSecondary,
  selectors: {
    '&[data-liquidated="true"]': {
      backgroundColor: vars.color.error,
      color: vars.color.textPrimary,
    },
  },
});

export const desktopView = style({
  display: 'block',
  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
  },
});

export const mobileView = style({
  display: 'block',
  '@media': {
    '(min-width: 1024px)': {
      display: 'none',
    },
  },
});

export const cardList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
});

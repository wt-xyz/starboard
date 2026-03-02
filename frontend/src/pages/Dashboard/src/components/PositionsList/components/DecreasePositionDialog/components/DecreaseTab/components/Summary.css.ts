import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const summaryRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  selectors: {
    '&:not(:last-child)': {
      marginBottom: '0.5rem',
    },
  },
});

export const summaryLabel = style({
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
});

export const summaryValue = style({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
});

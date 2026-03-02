import { style } from '@vanilla-extract/css';
import { alpha } from '@/styles/alpha';
import { vars } from '@/styles/theme.contract.css';

export const positionCard = style({
  backgroundColor: vars.color.cardBg,
  borderRadius: '0.5rem',
  padding: '0.75rem',
  border: `1px solid ${vars.color.borderDefault}`,
  transition: 'all 0.2s',
  flexShrink: 0,
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.borderStrong,
  },
});

export const statsRow = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '0.5rem',
  padding: '0.625rem',
  backgroundColor: alpha(vars.color.textPrimary, 5),
  borderRadius: '0.375rem',
  marginBottom: '0.5rem',
  '@media': {
    '(min-width: 800px) and (max-width: 1023px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
});

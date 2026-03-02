import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.contract.css';

export const thead = style({
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: vars.color.cardBg,
});

export const th = style({
  padding: '0.5rem 0.75rem',
  fontSize: '0.625rem',
  fontWeight: 600,
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  textAlign: 'right',
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${vars.color.borderDefault}`,
  userSelect: 'none',
});

export const thStar = style({
  textAlign: 'center',
});

export const thMarket = style({
  textAlign: 'left',
});

export const thSortable = style({
  cursor: 'pointer',
  transition: 'color 0.15s ease',
  ':hover': {
    color: vars.color.textPrimary,
  },
});

export const sortArrow = style({
  marginLeft: '0.25rem',
  fontSize: '0.5rem',
  opacity: 0.5,
});

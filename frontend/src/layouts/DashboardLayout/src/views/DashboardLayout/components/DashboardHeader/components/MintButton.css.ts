import { style } from '@vanilla-extract/css';
import { vars } from '../../../../../../../../styles/theme.contract.css';

export const mintButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '2.25rem',
  padding: '0 1rem',
  backgroundColor: 'transparent',
  color: vars.color.textPrimary,
  borderRadius: vars.radius.button,
  border: `1px solid ${vars.color.borderStrong}`,
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    borderColor: vars.color.borderStrong,
  },
  ':disabled': {
    color: vars.color.textDisabled,
    borderColor: vars.color.borderDefault,
    cursor: 'not-allowed',
  },
});

export const minting = style({
  borderColor: vars.color.primary,
  color: vars.color.primary,
});

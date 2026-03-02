import { style } from '@vanilla-extract/css';
import { alpha } from '../styles/alpha';
import { vars } from '../styles/theme.contract.css';

export const page = style({
  width: '100%',
  height: '100vh',
  backgroundColor: vars.color.pageBg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5rem',
  maxWidth: '600px',
  textAlign: 'center',
});

export const errorCode = style({
  fontSize: '8rem',
  fontWeight: 'bold',
  color: vars.color.primary,
  lineHeight: 1,
  textShadow: `0 0 40px ${alpha(vars.color.primary, 30)}`,
});

export const title = style({
  fontSize: '2rem',
  fontWeight: '600',
  color: vars.color.textPrimary,
  marginTop: '1rem',
});

export const text = style({
  fontSize: '1.125rem',
  color: vars.color.textSecondary,
  lineHeight: 1.6,
});

export const homeLink = style({
  marginTop: '2rem',
  padding: '0.75rem 2rem',
  backgroundColor: alpha(vars.color.primary, 20),
  border: `1px solid ${alpha(vars.color.primary, 30)}`,
  borderRadius: '0.5rem',
  color: vars.color.primary,
  fontSize: '1rem',
  fontWeight: '500',
  textDecoration: 'none',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: alpha(vars.color.primary, 30),
    borderColor: vars.color.primary,
    transform: 'translateY(-2px)',
  },
});

export const ghost = style({
  fontSize: '6rem',
  opacity: 0.3,
  marginBottom: '1rem',
});

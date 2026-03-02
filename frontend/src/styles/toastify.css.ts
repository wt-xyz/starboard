import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.contract.css';

// Toast container positioning
globalStyle('.Toastify__toast-container', {
  padding: '1rem',
});

// Base toast styling
globalStyle('.Toastify__toast', {
  backgroundColor: vars.color.cardBg,
  backdropFilter: 'blur(10px)',
  borderRadius: vars.radius.panel,
  border: `1px solid ${vars.color.borderDefault}`,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  color: vars.color.textPrimary,
  fontFamily: 'inherit',
  fontSize: vars.fontSize.body,
  padding: '0.75rem 1rem',
});

// Toast body
globalStyle('.Toastify__toast-body', {
  padding: 0,
  margin: 0,
  color: vars.color.textPrimary,
});

// Progress bar
globalStyle('.Toastify__progress-bar', {
  background: vars.color.primary,
  height: '3px',
});

// Success toast
globalStyle('.Toastify__toast--success', {
  borderColor: vars.color.success,
});

globalStyle('.Toastify__toast--success .Toastify__progress-bar', {
  background: vars.color.success,
});

// Error toast
globalStyle('.Toastify__toast--error', {
  borderColor: vars.color.error,
});

globalStyle('.Toastify__toast--error .Toastify__progress-bar', {
  background: vars.color.error,
});

// Info toast
globalStyle('.Toastify__toast--info', {
  borderColor: vars.color.primary,
});

// Warning toast
globalStyle('.Toastify__toast--warning', {
  borderColor: vars.color.warning,
});

globalStyle('.Toastify__toast--warning .Toastify__progress-bar', {
  background: vars.color.warning,
});

// Close button
globalStyle('.Toastify__close-button', {
  color: vars.color.textSecondary,
  opacity: 1,
  alignSelf: 'center',
});

globalStyle('.Toastify__close-button:hover', {
  color: vars.color.textPrimary,
});

// Toast icon
globalStyle('.Toastify__toast-icon', {
  marginRight: '0.75rem',
});

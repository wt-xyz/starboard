import { style } from '@vanilla-extract/css';

export const walletContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const walletButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-white)',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '14px',
  transition: 'background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: 'var(--color-primary-hover)',
    },
  },
});

export const walletStatusContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: 'var(--color-surface-secondary)',
  borderRadius: '8px',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontWeight: 500,
});

export const walletAddress = style({
  fontFamily: 'monospace',
  fontSize: '13px',
});

export const walletIcon = style({
  width: '16px',
  height: '16px',
});

export const disconnectButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  backgroundColor: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  fontSize: '12px',
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: 'var(--color-surface-hover)',
      color: 'var(--color-text-primary)',
    },
  },
});


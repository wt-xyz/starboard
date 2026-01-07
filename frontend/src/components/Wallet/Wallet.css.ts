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
  padding: '10px 20px',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: '#fff',
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '14px',
  letterSpacing: '-0.01em',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 12px rgba(99, 102, 241, 0.25)',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
});

export const walletStatusContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 8px 8px 14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 500,
});

export const walletAddress = style({
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.8)',
  letterSpacing: '0.02em',
});

export const walletIcon = style({
  width: '16px',
  height: '16px',
});

export const disconnectButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 12px',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#f87171',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      background: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

// Modal styles
export const modalOverlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease-out',
  '@keyframes': {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  },
});

export const modalContent = style({
  position: 'relative',
  background: 'linear-gradient(135deg, rgba(30, 32, 40, 0.95) 0%, rgba(20, 22, 28, 0.98) 100%)',
  borderRadius: '20px',
  padding: '32px',
  minWidth: '380px',
  maxWidth: '420px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: `
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 8px 40px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(99, 102, 241, 0.1)
  `,
  animation: 'slideUp 0.3s ease-out',
  '@keyframes': {
    slideUp: {
      from: {
        opacity: 0,
        transform: 'translateY(20px) scale(0.98)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      },
    },
  },
});

export const modalHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
});

export const modalTitle = style({
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: '#fff',
  margin: 0,
});

export const modalSubtitle = style({
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.5)',
  marginTop: '4px',
});

export const modalClose = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '10px',
  cursor: 'pointer',
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '18px',
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      transform: 'scale(1.05)',
    },
  },
});

export const connectorList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const connectorItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px 18px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  selectors: {
    '&:hover:not(:disabled)': {
      background: 'rgba(99, 102, 241, 0.1)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      transform: 'translateX(4px)',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
});

export const connectorIconWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  flexShrink: 0,
});

export const connectorIcon = style({
  width: '28px',
  height: '28px',
  borderRadius: '6px',
});

export const connectorInfo = style({
  flex: 1,
  minWidth: 0,
});

export const connectorName = style({
  fontSize: '15px',
  fontWeight: 600,
  color: '#fff',
  marginBottom: '2px',
});

export const connectorStatus = style({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.4)',
});

export const connectorArrow = style({
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.2)',
  transition: 'all 0.2s ease',
  selectors: {
    [`${connectorItem}:hover:not(:disabled) &`]: {
      color: 'rgba(99, 102, 241, 0.8)',
      transform: 'translateX(4px)',
    },
  },
});

export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const loadingSkeleton = style({
  height: '76px',
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)',
  backgroundSize: '200% 100%',
  borderRadius: '14px',
  animation: 'shimmer 1.5s ease-in-out infinite',
  '@keyframes': {
    shimmer: {
      '0%': { backgroundPosition: '200% 0' },
      '100%': { backgroundPosition: '-200% 0' },
    },
  },
});

export const modalError = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 16px',
  marginTop: '16px',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '12px',
  color: '#f87171',
  fontSize: '13px',
  fontWeight: 500,
});

export const modalFooter = style({
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  textAlign: 'center',
});

export const modalFooterText = style({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.35)',
});

export const modalFooterLink = style({
  color: 'rgba(99, 102, 241, 0.8)',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  selectors: {
    '&:hover': {
      color: '#818cf8',
      textDecoration: 'underline',
    },
  },
});

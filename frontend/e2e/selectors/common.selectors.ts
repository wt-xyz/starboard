/**
 * Common UI element selectors
 * Used across multiple pages/components
 */

export const CommonSelectors = {
  // Toast notifications
  toast: {
    success: '.Toastify__toast--success',
    error: '.Toastify__toast--error',
    info: '.Toastify__toast--info',
    warning: '.Toastify__toast--warning',
    container: '.Toastify__toast-container',
  },

  // Loading states
  loading: {
    spinner: '[class*="spinner"], [class*="loading"]',
  },

  // Navigation
  navigation: {
    header: 'header, nav',
    main: 'main, [role="main"]',
  },
} as const;

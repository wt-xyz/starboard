import { useCallback } from 'react';

/**
 * Lightweight helper that prompts users before moving to the mainnet network.
 * Can later be replaced with a richer dialog if needed.
 */
export const useMainnetSwitchWarning = () => {
  const maybeWarnBeforeSwitch = useCallback((targetIsMainnet: boolean, onConfirm: () => void) => {
    if (!targetIsMainnet) {
      onConfirm();
      return;
    }

    const confirmed = window.confirm(
      'You are switching to mainnet. Only proceed if you intend to use real funds.'
    );

    if (confirmed) {
      onConfirm();
    }
  }, []);

  return { maybeWarnBeforeSwitch };
};

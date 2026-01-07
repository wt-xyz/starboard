import type { Fuel } from 'fuels';

export const disconnect = (fuel: Fuel) => async (): Promise<void> => {
  try {
    await fuel.disconnect();
  } catch {
    // Ignore disconnect errors - wallet may already be disconnected
  }
};

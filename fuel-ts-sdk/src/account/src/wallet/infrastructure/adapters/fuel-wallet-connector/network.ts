import type { Fuel, Network as FuelsNetwork } from 'fuels';

export const getCurrentNetwork = (fuel: Fuel) => async (): Promise<FuelsNetwork> => {
  try {
    return await fuel.currentNetwork();
  } catch {
    // Return a default network if not connected
    // This allows the app to function before wallet connection
    return {
      chainId: 0,
      url: '',
    };
  }
};

export const changeNetwork =
  (fuel: Fuel) =>
  async (network: FuelsNetwork): Promise<void> => {
    try {
      await fuel.selectNetwork(network);
    } catch {
      // Silently fail if not connected - network will be set on connection
    }
  };

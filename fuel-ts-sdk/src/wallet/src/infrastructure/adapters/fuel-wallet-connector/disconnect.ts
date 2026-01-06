import type { FuelConnector } from 'fuels';

export const disconnect =
  (connectors: FuelConnector[]) =>
  async (connectorId: string): Promise<void> => {
    const connector = connectors.find((c) => c.name === connectorId);
    if (connector) {
      try {
        await connector.disconnect();
      } catch {
        // Ignore disconnect errors - wallet may already be disconnected
      }
    }
  };


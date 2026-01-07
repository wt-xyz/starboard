import type { Fuel } from 'fuels';
import type { WalletConnection } from '../../../domain';

export const connect =
  (fuel: Fuel) =>
  async (connectorId: string): Promise<WalletConnection> => {
    // Select the connector by name
    const connectors = await fuel.connectors();
    const connector = connectors.find((c) => c.name === connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    // Select this connector
    await fuel.selectConnector(connectorId);

    // Attempt to connect
    const connected = await fuel.connect();
    if (!connected) {
      throw new Error('Connection was rejected or failed');
    }

    // Get current account address
    const currentAccount = await fuel.currentAccount();
    if (!currentAccount) {
      throw new Error('No account found after connection');
    }

    return {
      address: currentAccount,
      connectorId,
    };
  };

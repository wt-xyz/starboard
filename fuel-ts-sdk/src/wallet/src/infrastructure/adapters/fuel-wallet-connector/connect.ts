import type { FuelConnector } from 'fuels';
import type { WalletConnection } from '../../../domain';

export const connect =
  (connectors: FuelConnector[]) =>
  async (connectorId: string): Promise<WalletConnection> => {
    const connector = connectors.find((c) => c.name === connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    // Attempt to connect
    const connected = await connector.connect();
    if (!connected) {
      throw new Error('Connection was rejected or failed');
    }

    // Get accounts from the connected wallet
    const accounts = await connector.accounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in wallet');
    }

    return {
      address: accounts[0],
      connectorId,
    };
  };

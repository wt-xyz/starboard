import type { ConnectorInfo, WalletConnection } from './wallet-connection.entity';

/**
 * WalletConnectorRepository - Port (interface) defining wallet connector contract
 *
 * This is the port in the Ports & Adapters (Hexagonal) architecture.
 * The application layer depends on this interface, not on concrete implementations.
 * Infrastructure adapters implement this interface.
 */
export interface WalletConnectorRepository {
  getAvailableConnectors(): Promise<ConnectorInfo[]>;

  connect(connectorId: string): Promise<WalletConnection>;

  disconnect(connectorId: string): Promise<void>;
}

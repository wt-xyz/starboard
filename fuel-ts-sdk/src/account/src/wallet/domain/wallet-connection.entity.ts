export interface WalletConnection {
  address: string;
  connectorId: string;
}

/**
 * Connector metadata for display in the UI
 */
export interface ConnectorInfo {
  id: string;
  name: string;
  installed: boolean;
  icon?: string;
}

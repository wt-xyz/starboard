import type { Account, Network as FuelsNetwork } from 'fuels';
import type { AssetId } from '@/shared/types';
import type { ConnectorInfo, WalletConnection } from './wallet-connection.entity';

/**
 * WalletConnectorRepository - Port (interface) defining wallet connector contract
 *
 * This is the port in the Ports & Adapters (Hexagonal) architecture.
 * The application layer depends on this interface, not on concrete implementations.
 * Infrastructure adapters implement this interface.
 */
export interface WalletConnectorRepository {
  // Connection management
  getAvailableConnectors(): Promise<ConnectorInfo[]>;
  connect(connectorId: string): Promise<WalletConnection>;
  disconnect(): Promise<void>;

  // Account data
  getUserBalances(): Promise<Record<AssetId, bigint>>;
  getWalletAccount(): Promise<Account | undefined>;

  // Network management
  getCurrentNetwork(): Promise<FuelsNetwork>;
  changeNetwork(network: FuelsNetwork): Promise<void>;

  // Event subscriptions (returns unsubscribe function)
  onConnectionChange(listener: (connected: boolean) => void): () => void;
  onNetworkChange(listener: (network: FuelsNetwork) => void): () => void;
}


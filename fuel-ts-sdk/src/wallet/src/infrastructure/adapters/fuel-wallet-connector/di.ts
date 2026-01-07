import { FuelWalletConnector, FueletWalletConnector } from '@fuels/connectors';
import type { FuelConnector } from 'fuels';
import type { WalletConnectorRepository } from '../../../domain';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { getAvailableConnectors } from './get-available-connectors';

/**
 * Creates default Fuel wallet connectors
 * Lazily initialized to avoid issues in non-browser environments
 */
let defaultConnectors: FuelConnector[] | null = null;

const getDefaultConnectors = (): FuelConnector[] => {
  if (!defaultConnectors) {
    defaultConnectors = [new FuelWalletConnector(), new FueletWalletConnector()];
  }
  return defaultConnectors;
};

/**
 * Creates a WalletConnectorRepository implementation using Fuel connectors
 */
export const createFuelWalletConnectorRepository = (
  connectors: FuelConnector[] = getDefaultConnectors()
): WalletConnectorRepository => ({
  getAvailableConnectors: getAvailableConnectors(connectors),
  connect: connect(connectors),
  disconnect: disconnect(connectors),
});

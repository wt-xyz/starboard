import { BakoSafeConnector, FuelWalletConnector, FueletWalletConnector } from '@fuels/connectors';
import { Fuel, type FuelConnector } from 'fuels';
import type { WalletConnectorRepository } from '../../../domain';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { getAvailableConnectors } from './get-available-connectors';
import { getUserBalances } from './get-user-balances';
import { getWalletAccount } from './get-wallet-account';
import { changeNetwork, getCurrentNetwork } from './network';

/**
 * Creates default Fuel wallet connectors
 * Lazily initialized to avoid issues in non-browser environments
 */
let fuelInstance: Fuel | null = null;

const getFuelInstance = (): Fuel => {
  if (!fuelInstance) {
    fuelInstance = new Fuel({
      connectors: [
        new FuelWalletConnector(),
        new FueletWalletConnector(),
        new BakoSafeConnector() as unknown as FuelConnector,
      ],
    });
  }
  return fuelInstance;
};

/**
 * Creates a WalletConnectorRepository implementation using the Fuel SDK
 */
export const createFuelWalletConnectorRepository = (
  fuel: Fuel = getFuelInstance()
): WalletConnectorRepository => ({
  // Connection management
  getAvailableConnectors: getAvailableConnectors(fuel),
  connect: connect(fuel),
  disconnect: disconnect(fuel),

  // Account data
  getUserBalances: getUserBalances(fuel),
  getWalletAccount: getWalletAccount(fuel),

  // Network management
  getCurrentNetwork: getCurrentNetwork(fuel),
  changeNetwork: changeNetwork(fuel),

  // Event subscriptions
  onConnectionChange: (listener) => {
    fuel.on(fuel.events.connection, listener);
    return () => fuel.off(fuel.events.connection, listener);
  },
  onNetworkChange: (listener) => {
    fuel.on(fuel.events.currentNetwork, listener);
    return () => fuel.off(fuel.events.currentNetwork, listener);
  },
});

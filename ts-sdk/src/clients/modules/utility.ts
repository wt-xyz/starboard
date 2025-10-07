import type {
  ComplianceResponse,
  ComplianceV2Response,
  HeightResponse,
  TimeResponse,
} from '../types';
import { FuelGraphQLClient } from './fuel-graphql';
import RestClient from './rest';

export default class UtilityClient extends RestClient {
  private _fuelClient?: FuelGraphQLClient;

  constructor(host: string, apiTimeout?: number, proxy?: any) {
    super(host, apiTimeout, proxy);

    // Detect if this is a Fuel GraphQL endpoint
    if (['localhost', '/graphql'].some((substr) => host.includes(substr))) {
      // Only go REST if a dydx related endpoint is detected
      this._fuelClient = new FuelGraphQLClient(
        // Connect to mainnet validator by default
        host.includes('/graphql') ? host : 'https://mainnet.fuel.network/v1/graphql',
      );
    }
  }

  /**
   * @description Check if using Fuel GraphQL backend
   */
  private get isFuel(): boolean {
    return this._fuelClient !== undefined;
  }

  /**
   * @description Get the current time of the Indexer
   * @returns {TimeResponse} isoString and epoch
   */
  async getTime(): Promise<TimeResponse> {
    if (this.isFuel) {
      const { time } = await this._fuelClient.getBlock('latest');
      return {
        iso: time,
        // TODO: verify that epoch data is correct
        // now it's time / 1000 per block
        epoch: new Date(time).getTime() / 1000,
      };
    }
    const uri = '/v4/time';
    return this.get(uri);
  }

  /**
   * @description Get the block height of the most recent block processed by the Indexer
   * @returns {HeightResponse} block height and time
   */
  async getHeight(): Promise<HeightResponse> {
    if (this.isFuel && this._fuelClient) {
      // Use Fuel GraphQL to get block height
      const block = await this._fuelClient.getBlock('latest');
      return {
        height: block.height,
        time: block.time,
      };
    }

    // Use indexer REST API (existing logic)
    const uri = '/v4/height';
    return this.get(uri);
  }

  /**
   * @description Screen an address to see if it is restricted
   * @param {string} address evm or dydx address
   * @returns {ComplianceResponse} whether the specified address is restricted
   */
  async screen(address: string): Promise<ComplianceResponse> {
    const uri = '/v4/screen';
    return this.get(uri, { address });
  }

  /**
   * @description Screen an address to see if it is restricted
   * @param {string} address evm or dydx address
   * @returns {ComplianceResponse} whether the specified address is restricted
   */
  async complianceScreen(address: string): Promise<ComplianceV2Response> {
    const uri = `/v4/compliance/screen/${address}`;
    return this.get(uri);
  }
}

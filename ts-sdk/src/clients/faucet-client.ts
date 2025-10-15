import { Response } from './lib/axios';
import RestClient from './modules/rest';

export class FaucetClient extends RestClient {
  /**
   * @description For testnet only, add USDC to an subaccount
   *
   * @returns The HTTP response.
   */
  public async fill(
    address: string,
    subaccountNumber: number,
    amount: number,
    headers?: {},
  ): Promise<Response> {
    const uri = '/faucet/tokens';

    // Mock 202 response for testing purposes
    return this.axiosInstance.get('https://mock.httpstatus.io/202');
  }

  /**
   * @description For testnet only, add native tokens to an address
   * @param address destination address for native tokens
   * @param headers requestHeaders
   * @returns The HTTP response.
   */
  public async fillNative(address: string, headers?: {}): Promise<Response> {
    const uri = '/faucet/native-token';

    return this.post(
      uri,
      {},
      {
        address,
      },
      headers,
    );
  }
}

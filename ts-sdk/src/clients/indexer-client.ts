import { IndexerConfig, DEFAULT_API_TIMEOUT } from './constants';
import AccountClient from './modules/account';
import MarketsClient from './modules/markets';
import UtilityClient from './modules/utility';
import VaultClient from './modules/vault';
import PositionsGraphQLClient from './modules/positions-graphql';

export class IndexerClient {
  public readonly config: IndexerConfig;
  readonly apiTimeout: number;
  readonly _markets: MarketsClient;
  readonly _account: AccountClient;
  readonly _utility: UtilityClient;
  readonly _vault: VaultClient;
  readonly _positionsGraphql?: PositionsGraphQLClient;

  constructor(config: IndexerConfig, apiTimeout?: number, graphqlEndpoint?: string) {
    this.config = config;
    this.apiTimeout = apiTimeout ?? DEFAULT_API_TIMEOUT;

    this._markets = new MarketsClient(config.restEndpoint, apiTimeout, config.proxy);
    this._account = new AccountClient(config.restEndpoint, apiTimeout, config.proxy);
    this._utility = new UtilityClient(config.restEndpoint, apiTimeout, config.proxy);
    this._vault = new VaultClient(config.restEndpoint, apiTimeout, config.proxy);

    if (graphqlEndpoint) {
      this._positionsGraphql = new PositionsGraphQLClient(graphqlEndpoint, apiTimeout);
    }
  }

  get markets(): MarketsClient {
    return this._markets;
  }

  get account(): AccountClient {
    return this._account;
  }

  get utility(): UtilityClient {
    return this._utility;
  }

  get vault(): VaultClient {
    return this._vault;
  }

  get positionsGraphql(): PositionsGraphQLClient | undefined {
    return this._positionsGraphql;
  }
}

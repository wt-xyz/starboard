import { createTradingModule } from '@sdk/Trading/di';
import type { Account } from 'fuels';
import { GraphQLClient } from 'graphql-request';
import { createClient as createWsClient } from 'graphql-ws';
import { createAccountsModule } from './Accounts/di';
import { createTestnetTokenCommands, createVaultCommands } from './shared/contracts';
import { createStoreService } from './shared/lib/StoreService';
import { createStore } from './shared/lib/redux';
import { createGraphqlWsTransport, createSubscriptionService } from './shared/lib/subscriptions';
import type { ContractId } from './shared/types';

export type StarboardClient = ReturnType<typeof createStarboardClient>;

export interface StarboardClientConfig {
  indexerUrl: string;
  vaultContractId?: ContractId;
  testnetTokenContractId?: ContractId;
  accountGetter: () => Promise<Account | null>;
}

export const createStarboardClient = (config: StarboardClientConfig) => {
  const graphqlClient = new GraphQLClient(config.indexerUrl);
  const wsClient = createWsClient({ url: toWsUrl(config.indexerUrl) });
  const subscriptionService = createSubscriptionService(createGraphqlWsTransport(wsClient));

  const accountsModule = createAccountsModule({
    walletGetter: config.accountGetter,
    vaultContractId: config.vaultContractId,
    testnetTokenContractId: config.testnetTokenContractId,
  });
  const tradingModule = createTradingModule({ graphqlClient });

  const starboardStore = createStore({
    ...tradingModule.getThunkExtras(),
    ...accountsModule.getThunkExtras(),
  });
  const storeService = createStoreService(starboardStore);

  const vaultCommands = createVaultCommands({
    vaultContractPort: accountsModule.services.contractsService,
    storeService,
  });
  const testnetTokenCommands = createTestnetTokenCommands({
    testnetTokenContractPort: accountsModule.services.contractsService,
    storeService,
  });

  const accountsCommandsAndQueries = accountsModule.createCommandsAndQueries({ storeService });
  const tradingCommandsAndQueries = tradingModule.createCommandsAndQueries({
    storeService,
    subscriptionService,
    vaultCommands,
    walletQueries: accountsCommandsAndQueries,
  });

  return {
    accounts: accountsCommandsAndQueries,
    trading: tradingCommandsAndQueries,

    __extra: {
      faucet: testnetTokenCommands.faucet,
    },
    store: starboardStore,
    dispose: () => wsClient.dispose(),
  };
};

const toWsUrl = (httpUrl: string) => httpUrl.replace(/^http/, 'ws');

import type { Network } from '@/models/Network';
import { EnvConfigSchema } from './env.schema';

export const envs = {
  getChainIdByNetwork(network: Network) {
    return ENV.chainIds[network];
  },
  getAllRpcUrls() {
    return ENV.rpcUrls;
  },
  getRpcUrlByNetwork(network: Network) {
    return ENV.rpcUrls[network];
  },
  getFallbackNetwork() {
    return ENV.defaultNetwork;
  },
  getIndexerUrlByNetwork(network: Network) {
    return ENV.indexerUrls[network];
  },
  getVaultContractIdByNetwork(network: Network) {
    return ENV.vaultContractIds[network];
  },
  getTestnetTokenContractIdByNetwork(network: Network) {
    return ENV.testnetTokenContractIds[network];
  },
  getDefaultNetwork() {
    return ENV.defaultNetwork;
  },

  isDev() {
    return ENV.env === 'dev';
  },

  /** Eth faucet predicate PIN (32-byte hex). When set, used for testnet ETH faucet. */
  getEthFaucetPin(): string | undefined {
    const v = ENV.ethFaucetPin;
    return v && v.trim().length > 0 ? v.trim() : undefined;
  },
};

const ENV = EnvConfigSchema.parse({
  indexerUrls: import.meta.env.VITE_INDEXER_URLS,
  vaultContractIds: import.meta.env.VITE_VAULT_CONTRACT_IDS,
  testnetTokenContractIds: import.meta.env.VITE_TESTNET_TOKEN_CONTRACT_IDS,
  rpcUrls: import.meta.env.VITE_RPC_URLS,
  chainIds: import.meta.env.VITE_CHAIN_IDS,
  defaultNetwork: import.meta.env.VITE_DEFAULT_ENVIRONMENT,
  env: import.meta.env.VITE_ENV,
  ethFaucetPin: import.meta.env.VITE_ETH_FAUCET_PIN,
});

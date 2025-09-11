import environments from '../../public/configs/v1/env.json';

// Whether we are in local or dev environment
export const isDev = process.env.NODE_ENV !== 'production';

export const AVAILABLE_ENVIRONMENTS = isDev
  ? environments.deployments.DEV // Local Env
  : environments.deployments.PROD; // Production Env
export const ENVIRONMENT_CONFIG_MAP = environments.environments;
export const TOKEN_CONFIG_MAP = environments.tokens;
export const LINKS_CONFIG_MAP = environments.links;
export const WALLETS_CONFIG_MAP = environments.wallets;
export type DydxNetwork = keyof typeof ENVIRONMENT_CONFIG_MAP;
export type DydxChainId = keyof typeof TOKEN_CONFIG_MAP;
export const DEFAULT_APP_ENVIRONMENT = AVAILABLE_ENVIRONMENTS.default as DydxNetwork;

export const NETWORKS = ['local', 'testnet', 'mainnet'] as const;
export type Network = (typeof NETWORKS)[number];

export type NetworkConfig = Record<Network, string>;

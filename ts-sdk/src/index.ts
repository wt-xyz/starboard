// Types.
export * from './types';

// Utility functions.
export * as helpers from './lib/helpers';
export * as onboarding from './lib/onboarding';
export * as utils from './lib/utils';
export * as validation from './lib/validation';

export { CompositeClient } from './clients/composite-client';
export { FaucetClient } from './clients/faucet-client';
export { IndexerClient } from './clients/indexer-client';
export { default as LocalWallet } from './clients/modules/local-wallet';
export { NobleClient } from './clients/noble-client';
export { SocketClient } from './clients/socket-client';
export { SubaccountInfo as SubaccountClient, SubaccountInfo } from './clients/subaccount';
export { ValidatorClient } from './clients/validator-client';
export { ByteArrayEncoding, encodeJson } from './lib/helpers';
export { NetworkOptimizer } from './network_optimizer';

// Position event processing
export { PositionEventProcessor } from './clients/position-event-processor';
export type {
    PositionAnalytics, PositionEvent, PositionEventProcessorConfig,
    PositionUpdate
} from './clients/position-event-processor';

// Re-export indexer Position types used by processor
export type {
    Position, PositionChange, PositionKey
} from './types/indexer';


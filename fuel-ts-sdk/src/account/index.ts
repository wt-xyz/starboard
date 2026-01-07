// Re-export wallet aggregate public API
export * from './src/wallet';

// Re-export account module DI
export { accountReducer, createAccountModule, type AccountModule, type AccountThunkExtras } from './di';


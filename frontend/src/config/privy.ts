import type { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  loginMethods: ['wallet'],
  appearance: {
    showWalletLoginFirst: true,
  },
};

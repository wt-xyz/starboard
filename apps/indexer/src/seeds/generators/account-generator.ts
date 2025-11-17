import { Account } from '../../model/generated/account.model';

export type AccountSpec = {
  address: string;
  subaccountNumber: number;
  isLiquidator?: boolean;
  isHandler?: boolean;
  isManager?: boolean;
};

/**
 * Default test accounts for seeding.
 */
export const DEFAULT_ACCOUNTS: AccountSpec[] = [
  {
    address: '0x1111111111111111111111111111111111111111',
    subaccountNumber: 0,
    isLiquidator: false,
    isHandler: false,
    isManager: false,
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    subaccountNumber: 0,
    isLiquidator: false,
    isHandler: false,
    isManager: false,
  },
  {
    address: '0x3333333333333333333333333333333333333333',
    subaccountNumber: 0,
    isLiquidator: false,
    isHandler: false,
    isManager: false,
  },
  {
    address: '0x4444444444444444444444444444444444444444',
    subaccountNumber: 0,
    isLiquidator: true, // Liquidator account
    isHandler: false,
    isManager: false,
  },
];

/**
 * Generate account entities for database seeding.
 * 
 * @param accounts - Account specifications (defaults to DEFAULT_ACCOUNTS)
 * @returns Array of Account entities ready to be inserted
 */
export function generateAccounts(accounts: AccountSpec[] = DEFAULT_ACCOUNTS): Account[] {
  return accounts.map((spec) => {
    const account = new Account({
      id: `${spec.address}-${spec.subaccountNumber}`,
      address: spec.address,
      subaccountNumber: spec.subaccountNumber,
      subaccountId: spec.address, // Set to address for simplicity
      isLiquidator: spec.isLiquidator || false,
      isHandler: spec.isHandler || false,
      isManager: spec.isManager || false,
    });

    return account;
  });
}

/**
 * Get all account addresses.
 */
export function getAllAccountAddresses(): string[] {
  return DEFAULT_ACCOUNTS.map(a => a.address);
}

/**
 * Get a specific account by address.
 */
export function getAccountByAddress(address: string): AccountSpec | undefined {
  return DEFAULT_ACCOUNTS.find(a => a.address === address);
}





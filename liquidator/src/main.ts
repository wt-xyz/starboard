import { Contract, Provider, Wallet } from 'fuels';
import vaultAbi from './abis/vault-abi.json' with { type: 'json' };

const INDEXER_URL = process.env.INDEXER_URL ?? '';
const FUEL_RPC_URL = process.env.FUEL_RPC_URL ?? '';

if (!INDEXER_URL) {
  throw new Error('INDEXER_URL environment variable is not set');
}

if (!FUEL_RPC_URL) {
  throw new Error('FUEL_RPC_URL environment variable is not set');
}

const POLL_INTERVAL_SECONDS_RAW = process.env.POLL_INTERVAL_SECONDS ?? '60';
const POLL_INTERVAL_SECONDS = (() => {
  const parsed = Number.parseInt(POLL_INTERVAL_SECONDS_RAW, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS_RAW}"`
    );
  }
  return parsed;
})();

const LIQUIDATION_QUERY = `
  query {
    liquidationStates(filter: { liquidationRatio: { lessThan: "1" } }) {
      nodes {
        account
        indexAssetId
        isLong
        liquidationRatio
      }
    }
  }
`;

type LiquidationStateNode = {
  account: string;
  indexAssetId: string;
  isLong: boolean;
  liquidationRatio: string;
};

type LiquidationStatesResponse = {
  data?: {
    liquidationStates: {
      nodes: LiquidationStateNode[];
    };
  };
  errors?: { message: string }[];
};

type AddressIdentity = { Address: { bits: string } };

const VAULT_CONTRACT_ID = process.env.VAULT_CONTRACT;
const LIQUIDATOR_PK = process.env.LIQUIDATOR_PK;

if (!VAULT_CONTRACT_ID) {
  throw new Error('VAULT_CONTRACT environment variable is not set');
}

if (!LIQUIDATOR_PK) {
  throw new Error('LIQUIDATOR_PK environment variable is not set');
}

const provider = new Provider(FUEL_RPC_URL);
const liquidatorWallet = Wallet.fromPrivateKey(LIQUIDATOR_PK, provider);
const liquidatorIdentity: AddressIdentity = {
  Address: { bits: liquidatorWallet.address.toHexString() },
};

const vault = new Contract(VAULT_CONTRACT_ID, vaultAbi, liquidatorWallet);

async function callWithGas(fnCall: any) {
  const tx = fnCall.assembleTxParams({
    feePayerAccount: liquidatorWallet,
  });
  const { waitForResult } = await tx.call();
  return waitForResult();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLiquidationStates(): Promise<LiquidationStateNode[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  let response: Response;
  try {
    response = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: LIQUIDATION_QUERY,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as LiquidationStatesResponse;

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join('; ');
    throw new Error(`GraphQL returned errors: ${messages}`);
  }

  return json.data?.liquidationStates.nodes ?? [];
}

async function pollLiquidationStates(): Promise<never> {
  // Run forever, querying every POLL_INTERVAL_SECONDS
  // and logging any undercollateralised positions.
  // If a query fails, log the error and retry after the delay.
  const intervalMs = POLL_INTERVAL_SECONDS * 1000;

  while (true) {
    const startedAt = new Date().toISOString();
    try {
      const nodes = await fetchLiquidationStates();
      console.log(
        `[${startedAt}] Found ${nodes.length} liquidation candidate(s) (liquidationRatio < 1)`
      );

      for (const node of nodes) {
        const accountIdentity: AddressIdentity = { Address: { bits: node.account } };

        try {
          console.log('  -> sending liquidate_position transaction');
          const fnCall = vault.functions.liquidate_position(
            accountIdentity,
            node.indexAssetId,
            node.isLong,
            liquidatorIdentity
          );
          await callWithGas(fnCall);
          console.log('  -> liquidation transaction sent successfully');
        } catch (txError) {
          console.error('  -> liquidation transaction failed', txError);
        }
      }
    } catch (error) {
      console.error(`[${startedAt}] Failed to fetch liquidation states`, error);
    }

    await sleep(intervalMs);
  }
}

void pollLiquidationStates();


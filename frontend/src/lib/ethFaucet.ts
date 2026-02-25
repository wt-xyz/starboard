/**
 * Pinned eth-faucet predicate: request testnet ETH or fund the faucet from the web wallet.
 * PIN comes from VITE_ETH_FAUCET_PIN (env) first, then artifact. Funding UI is in Advanced panel.
 */
import type { JsonAbi, Provider } from 'fuels';
import { Predicate } from 'fuels';
import predicateArtifacts from '@/assets/eth-faucet-predicate.json';
import { envs } from '@/lib/env';
import type { Network } from '@/models/Network';

const STORAGE_KEY_PREFIX = 'starboard_eth_faucet_';

type Artifact = {
  bytecodeHex: string;
  abi: JsonAbi;
  pin: string;
  maxFaucetAmount: number;
};

export type FaucetConfig = { pin: string; maxFaucetAmount: number };

function getArtifact(): Artifact {
  return predicateArtifacts as Artifact;
}

function normalizePin(pin: string): string {
  return pin.startsWith('0x') ? pin : `0x${pin}`;
}

/** Load faucet config: env PIN first, then localStorage (legacy), then artifact. */
export function getFaucetConfig(network: Network): FaucetConfig {
  const envPin = envs.getEthFaucetPin();
  if (envPin) {
    const art = getArtifact();
    return { pin: normalizePin(envPin), maxFaucetAmount: art.maxFaucetAmount };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + network);
    if (raw) {
      const parsed = JSON.parse(raw) as FaucetConfig;
      if (parsed.pin && typeof parsed.maxFaucetAmount === 'number')
        return { pin: normalizePin(parsed.pin), maxFaucetAmount: parsed.maxFaucetAmount };
    }
  } catch {
    // ignore
  }
  const art = getArtifact();
  return { pin: normalizePin(art.pin), maxFaucetAmount: art.maxFaucetAmount };
}

/** Save faucet config for a network (legacy; used when funding in-app without env PIN). */
export function saveFaucetConfig(network: Network, config: FaucetConfig): void {
  localStorage.setItem(STORAGE_KEY_PREFIX + network, JSON.stringify(config));
}

/** Get predicate address for a given pin (and artifact bytecode/abi). Used by the fund applet. */
export function getPredicateAddress(
  provider: Provider,
  pin: string,
  maxFaucetAmount: number
): string {
  const art = getArtifact();
  const bytecode = art.bytecodeHex.startsWith('0x') ? art.bytecodeHex : `0x${art.bytecodeHex}`;
  const pinB256 = pin.startsWith('0x') ? pin : `0x${pin}`;
  const predicate = new Predicate({
    bytecode,
    abi: art.abi,
    provider,
    configurableConstants: { PIN: pinB256, MAX_FAUCET_AMOUNT: maxFaucetAmount },
    data: [pinB256],
  });
  return predicate.address.toString();
}

/** Create predicate instance for request or for transfer (fund). */
function createPredicate(provider: Provider, config: FaucetConfig) {
  const art = getArtifact();
  const bytecode = art.bytecodeHex.startsWith('0x') ? art.bytecodeHex : `0x${art.bytecodeHex}`;
  const pin = config.pin.startsWith('0x') ? config.pin : `0x${config.pin}`;
  return new Predicate({
    bytecode,
    abi: art.abi,
    provider,
    configurableConstants: {
      PIN: pin,
      MAX_FAUCET_AMOUNT: config.maxFaucetAmount,
    },
    data: [pin],
  });
}

/**
 * Request testnet ETH from the faucet predicate.
 * Uses config from localStorage (if set when funding in-app) or artifact.
 */
export async function requestTestnetEth(
  provider: Provider,
  recipientAddress: string,
  network?: Network,
  amount?: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const config = network
      ? getFaucetConfig(network)
      : { pin: getArtifact().pin, maxFaucetAmount: getArtifact().maxFaucetAmount };
    const pin = config.pin.startsWith('0x') ? config.pin : `0x${config.pin}`;
    const effectiveConfig: FaucetConfig = { pin, maxFaucetAmount: config.maxFaucetAmount };

    const predicate = createPredicate(provider, effectiveConfig);
    const baseAssetId = await provider.getBaseAssetId();
    const transferAmount = amount ?? effectiveConfig.maxFaucetAmount;

    if (transferAmount <= 0) {
      return { success: false, error: 'Transfer amount must be greater than zero' };
    }
    if (transferAmount > effectiveConfig.maxFaucetAmount) {
      return {
        success: false,
        error: `Requested amount ${transferAmount} exceeds max faucet amount ${effectiveConfig.maxFaucetAmount}`,
      };
    }

    const tx = await predicate.transfer(recipientAddress, transferAmount, baseAssetId);
    const result = await Promise.race([
      tx.waitForResult(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timed out after 60s')), 60_000)
      ),
    ]);

    if (result.status === 'failure') {
      return { success: false, error: `Transaction failed (id: ${tx.id})` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

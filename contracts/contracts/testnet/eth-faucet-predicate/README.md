# Eth Faucet Predicate (pinned)

A **pinned** Sway predicate: it only succeeds when the caller supplies the correct PIN (runtime data) and the requested amount does not exceed `MAX_FAUCET_AMOUNT`. This obscures the faucet so random users cannot drain it; only the app (which knows the PIN) can request ETH.

- **PIN**: configurable constant; must match the runtime argument. Set when funding; the frontend artifact stores it.
- **MAX_FAUCET_AMOUNT**: configurable constant (default 5_000_000 = 0.005 ETH per request). Enforced in the predicate.

## Build

From this directory:

```bash
forc build
```

Or from repo root:

```bash
pnpm --filter starboard/contracts build:eth-faucet-predicate
```

Then write the frontend artifact (bytecode + ABI + placeholder PIN):

```bash
pnpm --filter starboard/contracts gen:eth-faucet-artifact
```

## Fund the predicate

After building, fund it with testnet (or local) ETH. Use a wallet that has ETH on the target network.

**Option A – generate a random PIN and write the frontend artifact:**

```bash
pnpm --filter starboard/contracts fund:eth-faucet-predicate -- --url=<RPC_URL> --privK=<PRIVATE_KEY> --out=../frontend/src/assets/eth-faucet-predicate.json
```

This generates a random PIN, funds the predicate (with that PIN and `MAX_FAUCET_AMOUNT`), and overwrites the frontend JSON with the real `pin` and `maxFaucetAmount`.

**Option B – use your own PIN:**

```bash
pnpm --filter starboard/contracts fund:eth-faucet-predicate -- --url=<RPC_URL> --privK=<PRIVATE_KEY> [--amount=1000000000] --pin=0x<32_BYTES_HEX>
```

Then add `pin` and `maxFaucetAmount` (5000000) to `frontend/src/assets/eth-faucet-predicate.json`.

- `amount`: base units (9 decimals). Default 1 ETH.
- `pin`: optional 32-byte hex; if omitted, a random pin is generated and printed.

## Frontend

When on testnet or local, the wallet modal shows **Get testnet ETH**. It uses the predicate with `configurableConstants: { PIN, MAX_FAUCET_AMOUNT }` and `data: [pin]` to transfer up to 0.005 ETH from the predicate to the connected wallet. Only the app (with the correct PIN in the artifact) can succeed.

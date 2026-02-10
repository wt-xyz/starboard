#!/usr/bin/env node
/**
 * Writes frontend/src/assets/eth-faucet-predicate.json from the built predicate.
 * Run after: pnpm build:eth-faucet-predicate
 * Uses a placeholder PIN (zeros); run fund:eth-faucet-predicate with --out to generate a real pin and overwrite.
 */
import { readFileSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const outDir = join(root, "contracts/testnet/eth-faucet-predicate/out/debug")
const frontendAsset = join(root, "../frontend/src/assets/eth-faucet-predicate.json")

const PLACEHOLDER_PIN = "0x0000000000000000000000000000000000000000000000000000000000000000"
const MAX_FAUCET_AMOUNT = 5_000_000

const bytecode = readFileSync(join(outDir, "eth-faucet-predicate.bin"))
const bytecodeHex = "0x" + bytecode.toString("hex")
const abi = JSON.parse(readFileSync(join(outDir, "eth-faucet-predicate-abi.json"), "utf-8"))

const artifact = {
    bytecodeHex,
    abi,
    pin: PLACEHOLDER_PIN,
    maxFaucetAmount: MAX_FAUCET_AMOUNT,
}

writeFileSync(frontendAsset, JSON.stringify(artifact, null, 2), "utf-8")
console.log("Wrote", frontendAsset)
console.log(
    "Use a real PIN by running: pnpm fund:eth-faucet-predicate -- --out=../frontend/src/assets/eth-faucet-predicate.json ...",
)

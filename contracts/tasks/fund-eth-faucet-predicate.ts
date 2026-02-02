/**
 * Fund the pinned eth-faucet predicate with testnet ETH.
 * Build first: pnpm build:eth-faucet-predicate
 *
 * Usage: tsx tasks/fund-eth-faucet-predicate.ts --url=<RPC_URL> --privK=<PRIVATE_KEY> [--amount=1000000000] [--pin=<B256_HEX>] [--out=<FRONTEND_ARTIFACT_PATH>]
 * - amount: base units (9 decimals). Default 1 ETH.
 * - pin: optional 32-byte hex (0x...). If omitted, a random pin is generated and printed.
 * - out: optional path to write frontend artifact JSON (bytecodeHex, abi, pin, maxFaucetAmount). If set, frontend can use it for "Get testnet ETH".
 */
import { randomBytes } from "crypto"
import { readFileSync, writeFileSync } from "fs"
import { Predicate, Provider, Wallet } from "fuels"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { getArgs } from "./utils.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFAULT_AMOUNT = "1000000000" // 1 ETH (9 decimals)
const MAX_FAUCET_AMOUNT = 5_000_000 // 0.005 ETH per request (must match predicate configurable)

function randomPinHex(): string {
    return "0x" + randomBytes(32).toString("hex")
}

if (import.meta.url === `file://${process.argv[1]}`) {
    fundEthFaucetPredicate(
        getArgs(["url", "privK"], ["amount", "pin", "out"]) as {
            url: string
            privK: string
            amount?: string
            pin?: string
            out?: string
        }
    )
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err)
            process.exit(1)
        })
}

export async function fundEthFaucetPredicate(taskArgs: {
    url: string
    privK: string
    amount?: string
    pin?: string
    out?: string
}) {
    const predicatePath = join(
        __dirname,
        "../contracts/testnet/eth-faucet-predicate/out/debug"
    )
    const bytecode = readFileSync(join(predicatePath, "eth-faucet-predicate.bin"))
    const bytecodeHex = "0x" + bytecode.toString("hex")
    const abi = JSON.parse(
        readFileSync(
            join(predicatePath, "eth-faucet-predicate-abi.json"),
            "utf-8"
        )
    )

    const pin = taskArgs.pin ?? randomPinHex()
    const pinB256 = pin.startsWith("0x") ? pin : "0x" + pin

    const provider = new Provider(taskArgs.url)
    const wallet = Wallet.fromPrivateKey(taskArgs.privK, provider)
    const baseAssetId = await provider.getBaseAssetId()
    const amount = taskArgs.amount ?? DEFAULT_AMOUNT

    const predicate = new Predicate({
        bytecode,
        abi,
        provider,
        configurableConstants: {
            PIN: pinB256,
            MAX_FAUCET_AMOUNT,
        },
        data: [pinB256],
    })

    console.log("Eth faucet predicate address:", predicate.address.toString())
    console.log("PIN (save for frontend):", pinB256)
    console.log("Funding with", amount, "base units (base asset)...")

    const tx = await wallet.transfer(
        predicate.address,
        amount,
        baseAssetId,
        { gasLimit: 10_000 }
    )
    await tx.waitForResult()
    console.log("Funded.")

    if (taskArgs.out) {
        const artifact = {
            bytecodeHex,
            abi,
            pin: pinB256,
            maxFaucetAmount: MAX_FAUCET_AMOUNT,
        }
        writeFileSync(taskArgs.out, JSON.stringify(artifact, null, 2), "utf-8")
        console.log("Wrote frontend artifact to", taskArgs.out)
    } else {
        console.log("Add to frontend src/assets/eth-faucet-predicate.json: pin =", pinB256, "and maxFaucetAmount =", MAX_FAUCET_AMOUNT)
    }
}

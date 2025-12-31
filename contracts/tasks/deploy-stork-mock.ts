import { Provider, Wallet } from "fuels"
import { getArgs } from "./utils.js"
import { StorkMockFactory } from "../types/StorkMockFactory.js"

if (import.meta.url === `file://${process.argv[1]}`) {
    deployStorkMock(getArgs(["url", "privK"]))
        .then(() => {
            process.exit(0)
        })
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}

export { deployStorkMock }

async function deployStorkMock(taskArgs: any) {
    console.log("Deploy a stork mock")

    const provider = new Provider(taskArgs.url)
    const deployer = Wallet.fromPrivateKey(taskArgs.privK, provider)

    console.log(`Deploying mocked stork contract`)
    const { waitForResult: waitForResultMockStorkContract } = await StorkMockFactory.deploy(deployer, {
        salt: "0x8000000000000000000000000000000000000000000000000000000000000000",
    })
    const { contract: mockStorkContract } = await waitForResultMockStorkContract()

    console.log(`Mocked Stork deployed to: contractId: ${mockStorkContract.id.toString()}`)

    return [mockStorkContract.id.toString()]
}

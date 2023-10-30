const { ethers, network, run } = require("hardhat")
const { networkConfig, developmentChains } = require("../../../helper-hardhat-config")
const { error } = require("console")

async function deployDice() {
    await run("compile")
    const chainId = network.config.chainId

    console.log(chainId)
    if (chainId != 31337) {
        console.log(networkConfig[chainId])
        const RpsFactory = await ethers.getContractFactory("RockPaperScissors")
        const rps = await RpsFactory.deploy(
            networkConfig[chainId].keyHash,
            networkConfig[chainId].subscriptionId,
            networkConfig[chainId].vrfCoordinator,
            networkConfig[chainId].linkEthFeed,
            networkConfig[chainId].vaultAddress
        )
        console.log(rps)
        if (rps.error) {
            throw new Error(
                `fail to deploy RockPaperScissors contract, error message: ${rps.error}`
            )
        }
        console.log("successfully deployed RockPaperScissors contract at", rps.address)
        // wait for 6 block confirmation to make sure contract completion of uploading bytecode
        await rps.deployTransaction.wait(6)
        // auto verification if not deployed on test chain
        if (!developmentChains.includes(network.name)) {
            await run("verify:verify", {
                address: rps.address,
                constructorArguments: [
                    networkConfig[chainId].keyHash,
                    networkConfig[chainId].subscriptionId,
                    networkConfig[chainId].vrfCoordinator,
                    networkConfig[chainId].linkEthFeed,
                    networkConfig[chainId].vaultAddress,
                ],
            })
        }
        // add dice contract to vault
        const vaultFactory = await ethers.getContractFactory("Vault")
        const vault = await vaultFactory.attach(networkConfig[chainId].vaultAddress)
        await vault.addGame(rps.address)
        console.log(
            `Successfully add RockPaperScissors address (${rps.address}) to vault (${vault.address})`
        )
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDice().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

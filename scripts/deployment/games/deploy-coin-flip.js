const { ethers, network, run } = require("hardhat")
const { networkConfig, developmentChains } = require("../../../helper-hardhat-config")
const { error } = require("console")

async function deployDice() {
    await run("compile")
    const chainId = network.config.chainId

    console.log(chainId)
    if (chainId != 31337) {
        console.log(networkConfig[chainId])
        const CoinFlipFactory = await ethers.getContractFactory("CoinFlip")
        const coinFlip = await CoinFlipFactory.deploy(
            networkConfig[chainId].keyHash,
            networkConfig[chainId].subscriptionId,
            networkConfig[chainId].vrfCoordinator,
            networkConfig[chainId].linkEthFeed,
            networkConfig[chainId].vaultAddress
        )
        console.log(coinFlip)
        if (coinFlip.error) {
            throw new Error(`fail to deploy CoinFlip contract, error message: ${coinFlip.error}`)
        }
        console.log("successfully deployed CoinFlip contract at", coinFlip.address)
        // wait for 6 block confirmation to make sure contract completion of uploading bytecode
        await coinFlip.deployTransaction.wait(6)

        // add dice contract to vault
        const vaultFactory = await ethers.getContractFactory("Vault")
        const vault = await vaultFactory.attach(networkConfig[chainId].vaultAddress)
        await vault.addGame(coinFlip.address)
        console.log(
            `Successfully add CoinFlip address (${coinFlip.address}) to vault (${vault.address})`
        )
        
        // auto verification if not deployed on test chain
        if (!developmentChains.includes(network.name)) {
            await run("verify:verify", {
                address: coinFlip.address,
                constructorArguments: [
                    networkConfig[chainId].keyHash,
                    networkConfig[chainId].subscriptionId,
                    networkConfig[chainId].vrfCoordinator,
                    networkConfig[chainId].linkEthFeed,
                    networkConfig[chainId].vaultAddress,
                ],
            })
        }

    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDice().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

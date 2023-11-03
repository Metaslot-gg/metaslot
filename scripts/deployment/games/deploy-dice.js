const { ethers, network, run } = require("hardhat")
const { networkConfig, developmentChains } = require("../../../helper-hardhat-config")
const { error } = require("console")

async function deployDice() {
    await run("compile")
    const chainId = network.config.chainId

    console.log(chainId)
    if (chainId != 31337) {
        console.log(networkConfig[chainId])
        const DiceFactory = await ethers.getContractFactory("Dice")
        const dice = await DiceFactory.deploy(
            networkConfig[chainId].keyHash,
            networkConfig[chainId].subscriptionId,
            networkConfig[chainId].vrfCoordinator,
            networkConfig[chainId].linkEthFeed,
            networkConfig[chainId].vaultAddress
        )
        console.log(dice)
        if (dice.error) {
            throw new Error(`fail to deploy Dice contract, error message: ${dice.error}`)
        }
        console.log("successfully deployed Dice contract at", dice.address)
        // wait for 6 block confirmation to make sure contract completion of uploading bytecode
        await dice.deployTransaction.wait(6)
        // auto verification if not deployed on test chain
        if (!developmentChains.includes(network.name)) {
            await run("verify:verify", {
                address: dice.address,
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
        await vault.addGame(dice.address)
        // await vault.addGame("0x9e4F4d53AB746AbF084614f7dF208847819c4A5e")
        console.log(`Successfully add dice address (${dice.address}) to vault (${vault.address})`)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDice().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

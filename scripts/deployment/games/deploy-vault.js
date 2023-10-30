const { ethers, network, run } = require("hardhat")
const {
    VERIFICATION_BLOCK_CONFIRMATIONS,
    networkConfig,
} = require("../../../helper-hardhat-config")

async function deployVault() {
    await run("compile")
    const chainId = network.config.chainId

    if (chainId != 31337) {
        const accounts = await ethers.getSigners()
        const deployer = accounts[0]
        console.log(networkConfig[chainId])
        const vaultFactory = await ethers.getContractFactory("Vault")
        const vault = await vaultFactory.deploy(deployer.address, deployer.address)
        if (vault.error) {
            throw new Error(vault.error)
        }
        console.log("Successfully deployed vault contract at", vault.address)
        console.log("Please fund your vault via your wallet at ", vault.address)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployVault().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

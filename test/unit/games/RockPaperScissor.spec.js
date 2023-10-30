const { network, ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { networkConfig, developmentChains } = require("../../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Rock Paper Scissors Unit Tests", async function () {
          // We define a fixture to reuse the same setup in every test.
          // We use loadFixture to run this setup once, snapshot that state,
          // and reset Hardhat Network to that snapshot in every test.

          // basic setups
          const BigNumber = ethers.BigNumber
          const pointOneLink = BigNumber.from("100000000000000000") // 0.1
          const pointZeroZeroThreeLink = BigNumber.from("3000000000000000") // 0.003
          const oneHundredLink = BigNumber.from("100000000000000000000") // 100 LINK
          const oneHundredGwei = BigNumber.from("100000000000")

          // Configuration

          // This value is the worst-case gas overhead from the wrapper contract under the following
          // conditions, plus some wiggle room:
          //   - 10 words requested
          //   - Refund issued to consumer
          const wrapperGasOverhead = BigNumber.from(60_000)
          const coordinatorGasOverhead = BigNumber.from(52_000)
          const wrapperPremiumPercentage = 10
          const maxNumWords = 10
          const weiPerUnitLink = pointZeroZeroThreeLink
          const flatFee = pointOneLink

          const fund = async (link, linkOwner, receiver, amount) => {
              await expect(link.connect(linkOwner).transfer(receiver, amount)).to.not.be.reverted
          }

          async function deployRandomNumberConsumerFixture() {
              const [deployer] = await ethers.getSigners()
              // deploy coordinator
              const coordinatorFactory = await ethers.getContractFactory(
                  "VRFCoordinatorV2Mock",
                  deployer
              )
              const coordinator = await coordinatorFactory.deploy(
                  pointOneLink,
                  1e9 // 0.000000001 LINK per gas
              )
              // deploy data feed
              const linkEthFeedFactory = await ethers.getContractFactory(
                  "MockV3Aggregator",
                  deployer
              )
              const linkEthFeed = await linkEthFeedFactory.deploy(18, weiPerUnitLink) // 1 LINK = 0.003 ETH

              const linkFactory = await ethers.getContractFactory("LinkToken", deployer)
              const link = await linkFactory.deploy()
              // deploy VRF wrapper
              const wrapperFactory = await ethers.getContractFactory("VRFV2Wrapper", deployer)
              const wrapper = await wrapperFactory.deploy(
                  link.address,
                  linkEthFeed.address,
                  coordinator.address
              )

              // subscription
              const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"
              const fundAmount = "1000000000000000000"
              const transaction = await coordinator.createSubscription()
              const transactionReceipt = await transaction.wait(1)
              const subscriptionId = ethers.BigNumber.from(transactionReceipt.events[0].topics[1])
              await coordinator.fundSubscription(subscriptionId, fundAmount)
              // deploy vault
              const vaultFactory = await ethers.getContractFactory("Vault")
              const vault = await vaultFactory.deploy(deployer.address, deployer.address)
              // deploy coin flip
              const RockPaperScissorsFactory = await ethers.getContractFactory("RockPaperScissors")
              const rps = await RockPaperScissorsFactory.deploy(
                  keyHash,
                  subscriptionId,
                  coordinator.address,
                  linkEthFeed.address,
                  vault.address
              )
              // add consumer contract to coordinator
              // add dice game to vault
              await coordinator.addConsumer(subscriptionId, rps.address)
              await vault.addGame(rps.address)
              // fund vault and dice contract
              await fund(link, deployer, rps.address, oneHundredLink)
              return { link, rps, vault, coordinator }
          }

          describe("RockPaperScissors_Play", async function () {
              describe("success", async function () {
                  it("pass", async function () {
                      const { link, rps, vault, coordinator } = await loadFixture(
                          deployRandomNumberConsumerFixture
                      )
                      const [deployer, player] = await ethers.getSigners()
                      // fund vault
                      await deployer.sendTransaction({
                          to: vault.address,
                          value: ethers.utils.parseEther("100.0"),
                      })
                      // play
                      console.log("player address", player.address)
                      console.log("player balance", await player.getBalance())
                      await expect(
                          rps.connect(player).RockPaperScissors_Play(
                              1000,
                              "0x0000000000000000000000000000000000000000",
                              0, // action: 0 -> rock, 1 -> paper, 2 -> Scissors
                              10,
                              20000,
                              3000,
                              { value: ethers.utils.parseEther("200") }
                          )
                      ).to.emit(rps, "RockPaperScissors_Play_Event")

                      await expect(coordinator.fulfillRandomWords(1, rps.address)).to.emit(
                          rps,
                          "RockPaperScissors_Outcome_Event"
                      )
                      console.log("player balance", await player.getBalance())
                      const outcomeEvent = await rps.queryFilter("RockPaperScissors_Outcome_Event")
                      assert(outcomeEvent.length == 1)
                      const rst = await rps.RockPaperScissors_GetState(player.address)
                      // game info should be removed after fulfilled
                      assert(rst.requestID == 0n)
                  })
              })
          })
      })

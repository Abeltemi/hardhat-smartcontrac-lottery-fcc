// grab development Chain to write the test on a develpment chain

const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Test", () => {
          //This to deploy??
          // raffle and our vrf mock they both have to be deployed first
          let raffle, raffleEntranceFee, interval
          let deployer
          let vrfCoordinatorV2Mock
          let chainId = network.config.chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // Allows to deploy aeverything in the deploy folder
              // get the most recent deployed contract and save into the fundMe variable
              // using ethers. Connect to an account

              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", () => {
              it("Initializes the raffle correctly", async () => {
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("enterRaffle", () => {
              //
              it("reverts when amount not equal entranceFee", async () => {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHEntered"
                  )
              })

              it("records players when they enter", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayers(0)
                  assert.equal(playerFromContract, deployer)
              })

              it("emits event on enter", async () => {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })

              it("doesn't allow entrance when raffle is calculating", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  // pretend to be a chainLink Keeper

                  await raffle.performUpKeep([])
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  )
              })

              describe("checkUpkeep", () => {
                  it("returns false if people haven't sent any ETH", async () => {
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                      assert(!upkeepNeeded)
                  })

                  it("returns if raffle isn't open", async () => {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      await raffle.performUpKeep([])
                      const raffleState = raffle.getRaffleState()
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                      assert(raffleState.toString(), "1")
                      assert(upkeepNeeded, false)
                  })

                  it("returns false if enough time hasn't passed", async () => {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                      await network.provider.request({ method: "evm_mine", params: [] })
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                      assert(!upkeepNeeded)
                  })

                  it("returns true if enough time has passed, has players, eth, and is open", async () => {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.request({ method: "evm_mine", params: [] })
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                      assert(upkeepNeeded)
                  })
              })
          })

          describe("performUpkeep", () => {
            it("it can only run if checkupkeep is true", async () => {

            })

            it("it revert when checkupkeep is false", async () => {
                
            })

            it("updates the raffle state, emits an event, and calls the vrf coordinator", async () => {
                
            })
          })
      })

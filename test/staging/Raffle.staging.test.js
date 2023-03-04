const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleEntranceFee, deployer, player // , deployer

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer // could also do with getNamedAccounts
              raffle = await ethers.getContract("Raffle", deployer) // Returns a new connection to the Raffle contract
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfilRandomWords", () => {
              it("words with live chainlink keepers and chainlink VRF, we get a random winner", async () => {
                  // Enter the raffle
                  // first the lastest timestamp
                  const startingTimeStamp = await raffle.getLastTimeStamp()
                  const accounts = await ethers.getSigners()

                  // setup listener before we enter the raffke
                  // Just in case the blockchain moves REALLY fast
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              // add our assert
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              player = await raffle.getPlayers(0)
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLastTimeStamp()

                              await expect(player, 0).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)

                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )

                              assert(endingTimeStamp > startingTimeStamp)

                          } catch (e) {
                              console.log(error)
                              reject(e)
                          }

                          resolve()
                      })
                      // Then entering the raffle

                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      const winnerStartingBalance = await accounts[0].getBalance()
                  })
              })
          })
      })



/** Before running the Staging Test on goerli test network
 * Get our SubId for Chainlink VRF
 * Deploy our Contract using the SubId
 * register he with chainlink VRF & it's subId
 * Register the contract with chainlink Keepers
 * Run the staging tests
*/
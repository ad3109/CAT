const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Vault", function () {
          let deployer, goldVault, mockV3AggregatorBTC, mockV3AggregatorETH, mockV3AggregatorGLD

          beforeEach(async () => {
              await deployments.fixture(["mocks", "gold"])
              deployer = (await getNamedAccounts()).deployer

              goldVault = await ethers.getContract("goldVault")

              mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorBTC")
              mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorETH")
              mockV3AggregatorGLD = await ethers.getContract("MockV3AggregatorGLD")
          })

          describe("constructor", function () {
              it("creates the CAT", async () => {
                  const response = await goldVault.getToken()
                  assert.isDefined(response)
              })

              it("sets the aggregator addresses correctly", async () => {
                  let response = await goldVault.getPriceFeed()
                  assert.equal(response, mockV3AggregatorGLD.address)
                  response = await goldVault.getBTCPriceFeed()
                  assert.equal(response, mockV3AggregatorBTC.address)
                  response = await goldVault.getETHPriceFeed()
                  assert.equal(response, mockV3AggregatorETH.address)
              })
          })
      })

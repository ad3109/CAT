const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Vault", function () {
          let deployer,
              goldVault,
              silverVault,
              wtiVault,
              lumberVault,
              wheatVault,
              mockV3AggregatorBTC,
              mockV3AggregatorETH,
              mockV3AggregatorGLD,
              mockV3AggregatorSLV,
              mockV3AggregatorLBS,
              mockV3AggregatorWTI,
              MockV3AggregatorWHEAT

          beforeEach(async () => {
              await deployments.fixture(["all"])
              deployer = (await getNamedAccounts()).deployer

              goldVault = await ethers.getContract("goldVault")
              silverVault = await ethers.getContract("silverVault")
              wtiVault = await ethers.getContract("wtiVault")
              lumberVault = await ethers.getContract("lumberVault")
              wheatVault = await ethers.getContract("wheatVault")

              mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorBTC")
              mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorETH")
              mockV3AggregatorGLD = await ethers.getContract("MockV3AggregatorGLD")
              mockV3AggregatorSLV = await ethers.getContract("MockV3AggregatorSLV")
              mockV3AggregatorLBS = await ethers.getContract("MockV3AggregatorLBS")
              mockV3AggregatorWTI = await ethers.getContract("MockV3AggregatorWTI")
              MockV3AggregatorWHEAT = await ethers.getContract("MockV3AggregatorWHEAT")
          })

          describe("constructor", function () {
              it("creates the CAT", async () => {
                  const response = await goldVault.getToken()
                  assert.isDefined(response)
              })
              /*it("sets the CAT correctly", async () => {
                  const response = CAT(await goldVault.getToken())
                  const nameResponse = response.name()
                  assert.isEqual(nameResponse, "gold")
                  const symbolResponse = response.symbol()
                  assert.isEqual(symbolResponse, "GLD")
              })*/
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

const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Integration Vault-CAT", function () {
          let deployer, lumberVault, mockV3AggregatorBTC, mockV3AggregatorETH, mockV3AggregatorLBS

          beforeEach(async () => {
              await deployments.fixture(["mocks", "vaults"])
              deployer = (await getNamedAccounts()).deployer
              lumberVault = await ethers.getContract("LUMBER_vault")

              mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorBTC")
              mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorETH")
              mockV3AggregatorLBS = await ethers.getContract("MockV3Aggregator_LUMBER")
          })

          describe("CAT contract creation", function () {
              it("initial supply equal to zero", async () => {
                  const contractAddress = await lumberVault.getToken()
                  const contract = await ethers.getContractAt("CAT", contractAddress)
                  const supply = await contract.totalSupply()
                  assert(supply, 0)
              })
          })
      })

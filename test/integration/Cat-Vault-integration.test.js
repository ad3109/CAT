const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Integration Vault-CAT", function () {
          let deployer, lumberVault, mockV3AggregatorBTC, mockV3AggregatorETH, mockV3AggregatorLBS

          beforeEach(async () => {
              await deployments.fixture(["mocks", "lumber"])
              deployer = (await getNamedAccounts()).deployer
              lumberVault = await ethers.getContract("lumberVault")

              mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorBTC")
              mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorETH")
              mockV3AggregatorLBS = await ethers.getContract("MockV3AggregatorLBS")
          })

          describe("CAT contract creation", function () {
              it("initial supply equal to zero", async () => {
                  const contractAddress = await lumberVault.getToken()
                  const contract = await ethers.getContractAt("CAT", contractAddress)
                  const supply = contract.totalSupply()
                  assert(supply, 0)
              })
          })
      })

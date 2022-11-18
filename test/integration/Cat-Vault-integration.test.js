const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Integration Vault-CAT", function () {
          let deployer, goldVault

          beforeEach(async () => {
              await deployments.fixture(["mocks", "vaults", "priceFeeds"])
              deployer = (await getNamedAccounts()).deployer
              goldVault = await ethers.getContract("XAU_vault")

              //   mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorWBTC")
              //   mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorWETH")
              //   priceFeedContract_LUMBER = await ethers.getContract("LUMBER_priceFeed")
          })

          describe("CAT contract creation", function () {
              it("initial supply equal to zero", async () => {
                  const contractAddress = await goldVault.getTokenAddress()
                  const contract = await ethers.getContractAt("CAT", contractAddress)
                  const supply = await contract.totalSupply()
                  assert(supply, 0)
              })
          })
      })

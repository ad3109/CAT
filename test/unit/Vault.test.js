const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Vault", async function () {
          let goldVault, silverVault, wtiVault, lumberVault, wheatVault
          deployer,
              mockV3AggregatorBTC,
              mockV3AggregatorETH,
              mockV3AggregatorGLD,
              mockV3AggregatorSLV,
              mockV3AggregatorLBS,
              mockV3AggregatorWTI,
              MockV3AggregatorWHEAT
          beforeEach(async function () {
              await deployments.fixture([all])
              deployer = (await getNamedAccounts()).deployer
              goldVault = await ethers.getContract("goldVault")
              silverVault = await ethers.getContract("silverVault")
              wtiVault = await ethers.getContract("wtiVault")
              lumberVault = await ethers.getContract("lumberVault")
              wheatVault = await ethers.getContract("wheatVault")
          })
      })

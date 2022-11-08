const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Vault", function () {
          let deployer, goldVault, mockV3AggregatorBTC, mockV3AggregatorETH, mockV3AggregatorGLD
          let borrower, liquidator, otherBorrower

          beforeEach(async () => {
              await deployments.fixture(["mocks", "vaults"])
              deployer = (await getNamedAccounts()).deployer
              borrower = (await getNamedAccounts()).borrower
              otherBorrower = (await getNamedAccounts()).otherBorrower
              liquidator = (await getNamedAccounts()).liquidator
              goldVault = await ethers.getContract("XAG_vault")

              mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorBTC")
              mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorETH")
              mockV3AggregatorLINK = await ethers.getContract("MockV3AggregatorLINK")
              mockV3AggregatorGLD = await ethers.getContract("MockV3Aggregator_XAU")
              mockWBTC = await ethers.getContract("MockBTC")
              mockWETH = await ethers.getContract("MockWETH")
              mockLINK = await ethers.getContract("MockLINK")
          })

          describe("constructor", function () {
              it("creates the CAT", async () => {
                  const response = await goldVault.getToken()
                  assert.isDefined(response)
              })

              it("sets the aggregator addresses correctly", async () => {
                  let response = await goldVault.s_catPriceFeedAddress()
                  assert.equal(response, mockV3AggregatorGLD.address)

                  assert.isTrue(await goldVault.isAllowedCollateral(mockWETH.address))
                  assert.isTrue(await goldVault.isAllowedCollateral(mockWBTC.address))
                  assert.isTrue(await goldVault.isAllowedCollateral(mockLINK.address))
                  assert.isFalse(
                      await goldVault.isAllowedCollateral(
                          "0x4aeceb6486d25d5015bf8f8323914a36204ed4b7"
                      )
                  )
                  assert.strictEqual(
                      await goldVault.s_tokenAddressToPriceFeed[mockWETH.address],
                      mockV3AggregatorETH.address
                  )
                  assert.strictEqual(
                      await goldVault.s_tokenAddressToPriceFeed[mockBTC.address],
                      mockV3AggregatorBTC.address
                  )
                  assert.strictEqual(
                      await goldVault.s_tokenAddressToPriceFeed[mockLINK.address],
                      mockV3AggregatorLINK.address
                  )
              })
          })
          describe("getUsdValue", function () {
              it("correctly calculates the USD value of a collateral token", async () => {})
              it("correctly calculates the USD value of the commodity asset token", async () => {})
          })

          describe("getTokenAmountFromUsd", function () {
              it("correctly calculates the collateral token amount for a given USD value", async () => {})
              it("correctly calculates the CAT amount for a given USD value", async () => {})
          })

          describe("addCollateral", function () {
              it("successfully adds eth as allowed collateral", async () => {})
              it("successfully adds allowed collateral", async () => {
                  //await mockWBTC.transfer(borrower.address, ethers.utils.)
              })
              it("reverts when adding not-allowed collateral", async () => {})
          })

          describe("withdrawCollateral", function () {
              it("successfully withraws existing collateral", async () => {})
              it("reverts when attempting to withdraw collateral", async () => {})
              it("reverts when attempting to withdraw invalid collateral type", async () => {})
              it("reverts when attempting to withdraw too much collateral", async () => {})
          })

          describe("borrow", function () {
              it("borrow/mint only when sufficient collateral is available for the borrowing account", async () => {})
              it("reverts if insufficient collateral is available for asked borrowAmount and user", async () => {})
          })

          describe("getAccountInformation", function () {
              it("returns zero if user does not have collateral at contract", async () => {})
              it("returns correct value if user does have a position at contract", async () => {})
          })

          describe("addCollateralAndMintCAT", function () {})

          describe("repayCATAndWithdrawCollateral", function () {})

          describe("repayLoan", function () {
              it("succesfully reduces borrowed amount after repay", async () => {})
              it("revert when attempting repay with different token", async () => {})
              it("refund excess when repaying more than borrowed amount", async () => {})
          })

          describe("liquidate", function () {
              it("reverts if liquidation is not allowed for target's collateral and borrow amount", async () => {})
              it("liquidates if target's collateral is insufficient for borrow amount", async () => {})
          })

          describe("fallback", function () {})

          describe("receive", function () {
              it("successfully adds eth as collateral for sender", async () => {})
          })
      })

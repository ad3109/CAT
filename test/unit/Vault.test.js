const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")
const { MockProvider } = require("ethereum-waffle")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Vault", function () {
          let deployer, goldVault, mockV3AggregatorBTC, mockV3AggregatorETH, mockV3AggregatorGLD
          let borrower, liquidator, otherBorrower
          let borrowerSigner

          beforeEach(async () => {
              await deployments.fixture(["mocks", "priceFeeds", "vaults"])
              mockV3AggregatorGLD = await ethers.getContract("MockV3AggregatorXAU")

              deployer = (await getNamedAccounts()).deployer
              borrower = (await getNamedAccounts()).borrower
              otherBorrower = (await getNamedAccounts()).otherBorrower
              liquidator = (await getNamedAccounts()).liquidator
              goldVault = await ethers.getContract("XAU_vault")

              borrowerSigner = await ethers.getSigner(borrower)

              mockV3AggregatorBTC = await ethers.getContract("MockV3AggregatorWBTC")
              mockV3AggregatorETH = await ethers.getContract("MockV3AggregatorWETH")
              mockV3AggregatorLINK = await ethers.getContract("MockV3AggregatorLINK")

              mockWBTC = await ethers.getContract("MockWBTC")
              mockWETH = await ethers.getContract("MockWETH")
              mockLINK = await ethers.getContract("MockLINK")
              randomToken = await ethers.getContract("randomToken")
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
                  assert.isFalse(await goldVault.isAllowedCollateral("0x4aeceb6486d25d5015bf8f8323914a36204ed4b7"))
                  assert.strictEqual(
                      await goldVault.getPriceFeedForCollateralToken(mockWETH.address),
                      mockV3AggregatorETH.address
                  )
                  assert.strictEqual(
                      await goldVault.getPriceFeedForCollateralToken(mockWBTC.address),
                      mockV3AggregatorBTC.address
                  )
                  assert.strictEqual(
                      await goldVault.getPriceFeedForCollateralToken(mockLINK.address),
                      mockV3AggregatorLINK.address
                  )
              })
          })
          describe("getPrice", function () {
              it("correctly fetches the USD price of a collateral token", async () => {
                  let [price, decimals] = await goldVault.getPrice(mockWBTC.address)
                  expect(price.toNumber()).to.equal(ethers.utils.parseUnits("21500", 8))
              })
              it("correctly fetches the USD price of the commodity token", async () => {
                  let [price] = await goldVault.getPrice(await goldVault.getToken())
                  expect(price.toNumber()).to.equal(165313848341)
              })
          })

          describe("getUsdValue", function () {
              it("correctly calculates the USD value of a collateral token", async () => {
                  //2 BTC == 43000 USD
                  let result = await goldVault.getUsdValue(mockWBTC.address, ethers.utils.parseUnits("2"))
                  expect(result).to.equal(ethers.utils.parseUnits("43000"))
              })
              it("correctly calculates the USD value of the commodity token", async () => {
                  //3500 USD / 1653.13848341 usd/ounce =
                  let result = await goldVault.getTokenAmountFromUsd(
                      await goldVault.getToken(),
                      ethers.utils.parseUnits("3500")
                  )
                  expect(result).to.equal(ethers.utils.parseUnits("2.117185000000967341"))
              })
          })

          describe("getTokenAmountFromUsd", function () {
              it("correctly calculates the collateral token amount for a given USD value", async () => {
                  //1500 USD => 200 LINK
                  let result = await goldVault.getTokenAmountFromUsd(mockLINK.address, ethers.utils.parseUnits("1500"))
                  expect(result).to.equal(ethers.utils.parseUnits("200"))
              })
              it("correctly calculates the CAT amount for a given USD value", async () => {
                  165313848341
              })
          })

          describe("addCollateral", function () {
              it("successfully adds WETH as allowed collateral", async () => {
                  await mockWETH.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("3"))
                  await mockWETH.connect(borrowerSigner).approve(goldVault.address, ethers.utils.parseUnits("2"))
                  //await mockWETH.connect(borrowerSigner).increaseAllowance(borrower, ethers.utils.parseUnits("2"))
                  await mockWETH
                      .connect(borrowerSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("2"))

                  await goldVault.connect(borrowerSigner).addCollateral(mockWETH.address, ethers.utils.parseUnits("2"))
                  let amountInContract = await goldVault.getCollateralAmountOfTokenOfUser(borrower, mockWETH.address)
                  let balanceAfter = await mockWETH.balanceOf(borrower)
                  expect(amountInContract).to.equal(ethers.utils.parseUnits("2"))
                  expect(ethers.utils.parseUnits("1")).to.equal(balanceAfter)
              })
              it("reverts when adding not-allowed collateral", async () => {
                  expect(await goldVault.addCollateral(randomToken.address, 2)).to.be.reverted()
              })
              it("reverts when trying to add a collateral amount the sender does not possess", async () => {})
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

const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains, initial_answer_prices_mocks } = require("../../helper-hardhat-config")
const { Contract } = require("ethers")
const { MockProvider } = require("ethereum-waffle")
const { hexStripZeros } = require("ethers/lib/utils")

//to run tests: set private functions back to public in Vaul.sol

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
              liquidator = (await getNamedAccounts()).liquidator
              goldVault = await ethers.getContract("XAU_vault")
              goldToken = await ethers.getContractAt("CAT", goldVault.getToken())

              borrowerSigner = await ethers.getSigner(borrower)
              deployerSigner = await ethers.getSigner(deployer)
              liquidatorSigner = await ethers.getSigner(liquidator)

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
                  let expected = ethers.utils.parseUnits("43000")
                  expect(result).to.equal(expected)
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
              beforeEach(async () => {
                  await mockWETH.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("3"))
                  await mockWETH
                      .connect(borrowerSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("2"))
              })
              it("successfully adds WETH as allowed collateral", async () => {
                  await goldVault.connect(borrowerSigner).addCollateral(mockWETH.address, ethers.utils.parseUnits("2"))
                  let amountInContract = await goldVault.getCollateralAmountOfTokenOfUser(borrower, mockWETH.address)
                  let balanceAfter = await mockWETH.balanceOf(borrower)
                  expect(amountInContract).to.equal(ethers.utils.parseUnits("2"))
                  expect(ethers.utils.parseUnits("1")).to.equal(balanceAfter)
              })

              it("reverts when trying to add a zero amount of collateral", async () => {
                  await expect(
                      goldVault.connect(borrowerSigner).addCollateral(mockWETH.address, ethers.utils.parseUnits("00"))
                  ).to.be.revertedWith("Vault__NeedsMoreThanZero")
              })

              it("reverts when trying to add a collateral amount the sender does not possess", async () => {
                  await expect(
                      goldVault.connect(borrowerSigner).addCollateral(mockWETH.address, ethers.utils.parseUnits("10"))
                  ).to.be.reverted
              })

              it("reverts when adding not-allowed collateral", async () => {
                  await expect(goldVault.addCollateral(randomToken.address, 2)).to.be.revertedWith(
                      "Vault__TokenNotAllowed"
                  )
              })
          })

          describe("getAccountInformation", function () {
              it("returns zero if user does not have collateral at contract", async () => {
                  let [totalCATValueMintedInUsd, collateralValueInUsd] = await goldVault.getAccountInformation(borrower)
                  let expected = ethers.utils.parseUnits("0")
                  expect(totalCATValueMintedInUsd).to.equal(expected)
                  expect(collateralValueInUsd).to.equal(expected)
              })
              it("returns correct value if user does have a position at contract", async () => {
                  await mockWETH.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("3"))
                  await mockWETH
                      .connect(borrowerSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("3"))
                  await goldVault.connect(borrowerSigner).addCollateral(mockWETH.address, ethers.utils.parseUnits("3"))
                  await goldVault.connect(borrowerSigner).mintCAT(ethers.utils.parseUnits("1"))

                  let [totalCATValueMintedInUsd, collateralValueInUsd] = await goldVault.getAccountInformation(borrower)
                  const expectedCATminted = ethers.utils.parseUnits(initial_answer_prices_mocks["XAU"].toString(), 10)
                  const expectedCollaterValue = ethers.utils
                      .parseUnits(initial_answer_prices_mocks["WETH"].toString(), 10)
                      .mul("3")
                  expect(totalCATValueMintedInUsd).to.equal(expectedCATminted)
                  expect(collateralValueInUsd).to.equal(expectedCollaterValue)
              })
          })

          describe("addCollateralAndMintCAT", function () {
              beforeEach(async () => {
                  await mockWETH.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("3"))
                  await mockWETH
                      .connect(borrowerSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("3"))
              })
              it("mints succesfully when adding sufficient collateral for the new loan by itself", async () => {
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateralAndMintCAT(
                          mockWETH.address,
                          ethers.utils.parseUnits("3"),
                          ethers.utils.parseUnits("1")
                      )
                  let [totalCATValueMintedInUsd, collateralValueInUsd] = await goldVault.getAccountInformation(borrower)
                  expect(totalCATValueMintedInUsd).to.equal(
                      ethers.utils.parseUnits(initial_answer_prices_mocks["XAU"].toString(), 10)
                  )
                  expect(collateralValueInUsd).to.equal(
                      ethers.utils.parseUnits((3 * initial_answer_prices_mocks["WETH"]).toString(), 10)
                  )
              })
              it("mints succesfully when adding sufficient collateral for the new loan when some collateral is already deposited", async () => {
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateral(mockWETH.address, ethers.utils.parseUnits("2.5"))
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateralAndMintCAT(
                          mockWETH.address,
                          ethers.utils.parseUnits("0.5"),
                          ethers.utils.parseUnits("1")
                      )
                  let [totalCATValueMintedInUsd, collateralValueInUsd] = await goldVault.getAccountInformation(borrower)
                  expect(totalCATValueMintedInUsd).to.equal(
                      ethers.utils.parseUnits(initial_answer_prices_mocks["XAU"].toString(), 10)
                  )
                  expect(collateralValueInUsd).to.equal(
                      ethers.utils.parseUnits((3 * initial_answer_prices_mocks["WETH"]).toString(), 10)
                  )
              })
              it("mints succesfully when adding sufficient collateral for the new loan + existing loan", async () => {
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateralAndMintCAT(
                          mockWETH.address,
                          ethers.utils.parseUnits("2.9"),
                          ethers.utils.parseUnits("0.5")
                      )
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateralAndMintCAT(
                          mockWETH.address,
                          ethers.utils.parseUnits("0.1"),
                          ethers.utils.parseUnits("0.5")
                      )
                  let [totalCATValueMintedInUsd, collateralValueInUsd] = await goldVault.getAccountInformation(borrower)

                  expect(totalCATValueMintedInUsd).to.equal(
                      ethers.utils.parseUnits(initial_answer_prices_mocks["XAU"].toString(), 10)
                  )
                  expect(collateralValueInUsd).to.equal(
                      ethers.utils.parseUnits((3 * initial_answer_prices_mocks["WETH"]).toString(), 10)
                  )
              })
              it("reverts when new loan + existing loan is too high for existing collateral + new collateral", async () => {
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateralAndMintCAT(
                          mockWETH.address,
                          ethers.utils.parseUnits("2"),
                          ethers.utils.parseUnits("1")
                      )
                  await expect(
                      goldVault
                          .connect(borrowerSigner)
                          .addCollateralAndMintCAT(
                              mockWETH.address,
                              ethers.utils.parseUnits("1"),
                              ethers.utils.parseUnits("1.5")
                          )
                  ).to.be.revertedWith("Vault__BreaksHealthFactor")
              })
          })

          describe("repayLoan", function () {
              beforeEach(async () => {
                  await mockWBTC._mintToken(deployer, ethers.utils.parseUnits("10"))
                  await mockWBTC.increaseAllowance(goldVault.address, ethers.utils.parseUnits("10"))
                  await goldVault.addCollateralAndMintCAT(
                      mockWBTC.address,
                      ethers.utils.parseUnits("10"),
                      ethers.utils.parseUnits("3")
                  )
                  //about 2.31% LoanToValue

                  await mockWBTC._mintToken(liquidator, ethers.utils.parseUnits("100"))
                  await mockWBTC
                      .connect(liquidatorSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("100"))
                  await mockWBTC
                      .connect(liquidatorSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("100"))
                  await goldVault
                      .connect(liquidatorSigner)
                      .addCollateralAndMintCAT(
                          mockWBTC.address,
                          ethers.utils.parseUnits("50"),
                          ethers.utils.parseUnits("10")
                      )
                  await goldToken.increaseAllowance(goldVault.address, ethers.utils.parseUnits("10"))
                  await goldToken.increaseAllowance(liquidator, ethers.utils.parseUnits("10"))
              })
              it("succesfully reduces borrowed amount after repay", async () => {
                  await goldVault.repayCAT(ethers.utils.parseUnits("2"))
                  expect(await goldToken.balanceOf(deployer)).to.equal(ethers.utils.parseUnits("1"))
                  const amountTokensMinted = await goldVault.getAmountOfTokensMinted(deployer)
                  expect(amountTokensMinted).to.equal(ethers.utils.parseUnits("1"))
              })
              it("revert when attempting repay an amount that the repayer does not possess", async () => {
                  await goldToken.transfer(liquidator, ethers.utils.parseUnits("2")) //current amount of CAT tokens of deployer = 1 (borrowed 3)
                  await expect(goldVault.repayCAT(ethers.utils.parseUnits("2"))).to.be.reverted
              })
              it("only transfer what is required when repaying more than borrowed amount", async () => {
                  await goldToken.connect(liquidatorSigner).transfer(deployer, ethers.utils.parseUnits("10"))
                  await goldVault.repayCAT(ethers.utils.parseUnits("13"))
                  const catTokensBorrowedForUser = await goldVault.getAmountOfTokensMinted(deployer)
                  const catTokensInWallet = await goldToken.balanceOf(deployer)
                  expect(catTokensBorrowedForUser).to.equal(ethers.utils.parseUnits("0"))
                  expect(catTokensInWallet).to.equal(ethers.utils.parseUnits("10"))
              })
          })

          describe("withdrawing and borrowing", function () {
              beforeEach(async () => {
                  await mockWETH.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("3"))
                  await mockWETH
                      .connect(borrowerSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("3"))
                  await goldVault.connect(borrowerSigner).addCollateral(mockWETH.address, ethers.utils.parseUnits("3"))
              })
              describe("withdrawCollateral", function () {
                  it("successfully withdraws existing collateral", async () => {
                      await goldVault
                          .connect(borrowerSigner)
                          .withdrawCollateral(mockWETH.address, ethers.utils.parseUnits("1"))
                      let amountAfterBorrower = await mockWETH.balanceOf(borrower)
                      let amountAfterInContract = await goldVault.getCollateralAmountOfTokenOfUser(
                          borrower,
                          mockWETH.address
                      )
                      expect(amountAfterBorrower).to.equal(ethers.utils.parseUnits("1"))
                      expect(amountAfterInContract).to.equal(ethers.utils.parseUnits("2"))
                  })
                  it("reverts when attempting to withdraw invalid collateral type", async () => {
                      await expect(
                          goldVault
                              .connect(borrowerSigner)
                              .withdrawCollateral(mockLINK.address, ethers.utils.parseUnits("1"))
                      ).to.be.reverted
                  })
                  it("reverts when attempting to withdraw more collateral than the vault has in deposits", async () => {
                      await expect(
                          goldVault
                              .connect(borrowerSigner)
                              .withdrawCollateral(mockWETH.address, ethers.utils.parseUnits("10"))
                      ).to.be.reverted
                  })
                  it("reverts when attempting to withdraw more collateral that the user provided of that collateral type (health factor still ok)", async () => {
                      await mockWBTC.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("5"))
                      await mockWBTC
                          .connect(borrowerSigner)
                          .increaseAllowance(goldVault.address, ethers.utils.parseUnits("5"))
                      await goldVault
                          .connect(borrowerSigner)
                          .addCollateral(mockWBTC.address, ethers.utils.parseUnits("5"))
                      let valueBeforeWithdrawal = await goldVault.getCollateralAmountUsdForUser(borrower) //112171 USD
                      await goldVault.connect(borrowerSigner).mintCAT(ethers.utils.parseUnits("10"))
                      //borrowed approx. 16k USD  => withdrawing 4 eth worth approx 6k should be no issue for available collateral of WBTC
                      //but only 3 eth available for user
                      await expect(
                          goldVault
                              .connect(borrowerSigner)
                              .withdrawCollateral(mockWETH.address, ethers.utils.parseUnits("4"))
                      ).to.be.reverted
                  })
                  it("reverts when attempting to withdraw too much collateral (health factor not ok)", async () => {
                      await mockWBTC.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("5"))
                      await mockWBTC
                          .connect(borrowerSigner)
                          .increaseAllowance(goldVault.address, ethers.utils.parseUnits("5"))
                      await goldVault
                          .connect(borrowerSigner)
                          .addCollateral(mockWBTC.address, ethers.utils.parseUnits("5"))
                      let valueBeforeWithdrawal = await goldVault.getCollateralAmountUsdForUser(borrower) //112171 USD
                      let usdValueToWithdraw = valueBeforeWithdrawal
                          .mul(ethers.utils.parseUnits("0.65"))
                          .div(ethers.utils.parseUnits("1"))
                      let catAmountToBorrow = await goldVault.getTokenAmountFromUsd(
                          await goldVault.getToken(),
                          usdValueToWithdraw
                      ) //value just below safety level

                      await goldVault.connect(borrowerSigner).mintCAT(catAmountToBorrow)
                      //withdrawing 3 eth worth would now be an issue
                      await expect(
                          goldVault
                              .connect(borrowerSigner)
                              .withdrawCollateral(mockWETH.address, ethers.utils.parseUnits("3"))
                      ).to.be.revertedWith("Vault__BreaksHealthFactor")
                  })
              })

              describe("borrow", function () {
                  it("borrow/mint only when sufficient collateral is available for the borrowing account", async () => {
                      await goldVault.connect(borrowerSigner).mintCAT(ethers.utils.parseUnits("1")) //collateral is 4671 & loanAmount = 1653 < 0.6667*4671
                      let [totalCATValueMintedInUsd] = await goldVault.getAccountInformation(borrower)
                      expect(totalCATValueMintedInUsd).to.equal(
                          ethers.utils.parseUnits(initial_answer_prices_mocks["XAU"].toString(), 10)
                      )
                  })
                  it("reverts if insufficient collateral is available for asked borrowAmount", async () => {
                      await expect(
                          goldVault.connect(borrowerSigner).mintCAT(ethers.utils.parseUnits("4"))
                      ).to.be.revertedWith("Vault__BreaksHealthFactor") //collateral is 4671 & loanAmount = 4*1653>4671
                  })
                  it("reverts if insufficient collateral is available for asked borrowAmount and user", async () => {
                      await expect(goldVault.mintCAT(ethers.utils.parseUnits("1"))).to.be.revertedWith(
                          "Vault__BreaksHealthFactor"
                      ) //collateral is 4671 in total but 0 for this user & loanAmount = 1653<0
                  })
                  it("reverts if insufficient collateral is available for the asked borrowAmount when another loan is already present", async () => {
                      await goldVault.connect(borrowerSigner).mintCAT(ethers.utils.parseUnits("1")) //collateral is 4671 & loanAmount = 1653 < 0.6667*4671
                      //first loan is succesful - should revert on second loan
                      await expect(
                          goldVault.connect(borrowerSigner).mintCAT(ethers.utils.parseUnits("1"))
                      ).to.be.revertedWith("Vault__BreaksHealthFactor")
                  })
              })

              describe("repayCATAndWithdrawCollateral", function () {
                  it("succesfully repays and withdraws collateral", async () => {
                      await mockWBTC._mintToken(deployer, ethers.utils.parseUnits("10"))
                      await mockWBTC.increaseAllowance(goldVault.address, ethers.utils.parseUnits("10"))
                      await goldVault.addCollateralAndMintCAT(
                          mockWBTC.address,
                          ethers.utils.parseUnits("10"),
                          ethers.utils.parseUnits("3")
                      )
                      await goldToken.increaseAllowance(goldVault.address, ethers.utils.parseUnits("3"))
                      await goldVault.repayCATAndWithdrawCollateral(
                          mockWBTC.address,
                          ethers.utils.parseUnits("10"),
                          ethers.utils.parseUnits("3")
                      )
                      const catTokensInWallet = await goldToken.balanceOf(deployer)
                      expect(catTokensInWallet).to.equal(ethers.utils.parseUnits("0"))
                  })
                  //repay and withdraw tested separately
              })
          })

          describe("liquidate", function () {
              beforeEach(async () => {
                  //borrower needs collateral and create a loan
                  await mockWETH.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("10"))
                  await mockWETH
                      .connect(borrowerSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("10"))
                  await goldVault
                      .connect(borrowerSigner)
                      .addCollateralAndMintCAT(
                          mockWETH.address,
                          ethers.utils.parseUnits("10"),
                          ethers.utils.parseUnits("5")
                      ) //53.09% LTV

                  //liquidator needs commodity tokens to repay the loan
                  await mockWBTC.connect(liquidatorSigner)._mintToken(liquidator, ethers.utils.parseUnits("50"))
                  await mockWBTC
                      .connect(liquidatorSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("50"))
                  await goldVault
                      .connect(liquidatorSigner)
                      .addCollateralAndMintCAT(
                          mockWBTC.address,
                          ethers.utils.parseUnits("50"),
                          ethers.utils.parseUnits("100")
                      )
                  await goldToken
                      .connect(liquidatorSigner)
                      .increaseAllowance(goldVault.address, ethers.utils.parseUnits("100"))
              })

              //function liquidate(        address addressOfCollateralToBeSeized,        address user,        uint256 debtToCover    )
              it("reverts liquidation attempt if health factor ok", async () => {
                  await expect(
                      goldVault
                          .connect(liquidatorSigner)
                          .liquidate(mockWETH.address, borrower, ethers.utils.parseUnits("1"))
                  ).to.be.revertedWith("Vault__HealthFactorOk")
              })

              describe("distressed borrower", async function () {
                  beforeEach(async () => {
                      //if we set the price of the gold tokens to $2179.8, we get a LTV of 70% >66.666% which is liquidation territory
                      mockV3AggregatorGLD.updateAnswer(ethers.utils.parseUnits("2179.8", 8))
                  })
                  it("succeeds in partial liquidation if health factor after < health factor before, single token collateral", async () => {
                      await goldVault
                          .connect(liquidatorSigner)
                          .liquidate(mockWETH.address, borrower, ethers.utils.parseUnits("5"))
                      //paying off everything => has value of 5*2179.8 = $ 10899
                      //a 10% markup means that liquidator should seize $ 11988.9
                      //which is equal to 11988.9/1557 = 7.7 WETH

                      const amountWETHafterLiquidator = await mockWETH.balanceOf(liquidator)
                      expect(amountWETHafterLiquidator).to.equal(ethers.utils.parseUnits("7.7"))
                      expect(await goldToken.balanceOf(liquidator)).to.equal(ethers.utils.parseUnits("95"))

                      const [totalCATValueMintedInUsdAfter, collateralValueInUsdAfter] =
                          await goldVault.getAccountInformation(borrower)
                      expect(totalCATValueMintedInUsdAfter).to.equal(ethers.utils.parseUnits("0"))

                      //collateralvalueBefore was 10*1557, after seizing: should equal: 3581.1
                      expect(collateralValueInUsdAfter).to.equal(ethers.utils.parseUnits("3581.1"))
                  })

                  it("reverts liquidation attempt if liquidator does not have sufficient tokens", async () => {
                      await expect(
                          goldVault
                              .connect(deployer)
                              .liquidate(mockWETH.address, borrower, ethers.utils.parseUnits("5"))
                      ).to.be.reverted
                  })

                  it("reverts liquidation attempt if liquidator tries to liquidate more tokens than the borrower has deposited", async () => {
                      //if we set the price of the gold tokens to $2179.8, we get a LTV of 70% >66.666% which is liquidation territory
                      await mockLINK.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("1"))
                      await mockLINK
                          .connect(borrowerSigner)
                          .increaseAllowance(goldVault.address, ethers.utils.parseUnits("1"))
                      await goldVault
                          .connect(borrowerSigner)
                          .addCollateral(mockLINK.address, ethers.utils.parseUnits("1"))
                      await expect(
                          goldVault
                              .connect(liquidatorSigner)
                              .liquidate(mockLINK.address, borrower, ethers.utils.parseUnits("2"))
                      ).to.be.revertedWith("Vault__SeizingTooMuchCollateral")
                  })

                  it("succeeds in partial liquidation if health factor after < health factor before, multi token collateral", async () => {
                      await mockLINK.connect(borrowerSigner)._mintToken(borrower, ethers.utils.parseUnits("1"))
                      await mockLINK
                          .connect(borrowerSigner)
                          .increaseAllowance(goldVault.address, ethers.utils.parseUnits("1"))
                      await goldVault
                          .connect(borrowerSigner)
                          .addCollateral(mockLINK.address, ethers.utils.parseUnits("1"))

                      await goldVault
                          .connect(liquidatorSigner)
                          .liquidate(mockWETH.address, borrower, ethers.utils.parseUnits("5"))
                      //paying off everything => has value of 5*2179.8 = $ 10899
                      //a 10% markup means that liquidator should seize $ 11988.9
                      //which is equal to 11988.9/1557 = 7.7 WETH

                      const amountWETHafterLiquidator = await mockWETH.balanceOf(liquidator)
                      expect(amountWETHafterLiquidator).to.equal(ethers.utils.parseUnits("7.7"))
                      expect(await goldToken.balanceOf(liquidator)).to.equal(ethers.utils.parseUnits("95"))

                      const [totalCATValueMintedInUsdAfter, collateralValueInUsdAfter] =
                          await goldVault.getAccountInformation(borrower)
                      expect(totalCATValueMintedInUsdAfter).to.equal(ethers.utils.parseUnits("0"))

                      //collateralvalueBefore was 10*1557+1*7.5, after seizing: should equal: 3588.6
                      expect(collateralValueInUsdAfter).to.equal(ethers.utils.parseUnits("3588.6"))
                  })
              })
          })
      })

const { ethers } = require("hardhat")
const { assert, expect } = require("chai")

describe("Token contract", function () {
    let CAT, owner
    beforeEach(async () => {
        owner = await ethers.getSigners()[0]
        const CATFactory = await ethers.getContractFactory("CAT")
        CAT = await CATFactory.deploy("Oil", "WTI")
    })
    describe("constructor", function () {
        it("token name and symbol set correctly", async function () {
            const nameResponse = await CAT.name()
            const symbolResponse = await CAT.symbol()
            assert.equal(nameResponse, "Oil")
            assert.equal(symbolResponse, "WTI")
        })
        it("supply is zero after construction", async function () {
            const response = await CAT.totalSupply()
            expect(response).to.equal(0)
        })
    })
})

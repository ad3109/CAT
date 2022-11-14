from brownie import web3, accounts


def test_ownership(wheatToken, dex):
    pass
    # assert dex.address == wheatToken.owner()


def test_getSwapPrice(dex):
    xInput = 27244526922564142057 #input in wei
    xReserves = 1000000000000000000000000 # amount of ETH in pool
    yReserves = 3670461980000000000000000 # amount of token in pool
    yOutput = dex.getSwapPrice(xInput, xReserves, yReserves) # returns number of tokens you will get for swap
    print('Output tokens received ' + str(yOutput)) # i should get about a 100 - fees - slippage tokens in return


def test_tokenInit(dex, wheatToken, riceToken, coffeeToken):
    dex.initToken(wheatToken.address)
    dex.initToken(riceToken.address)
    dex.initToken(coffeeToken.address)

    assert dex.supportedTokens(0) == wheatToken.address 
    assert dex.supportedTokens(1) == riceToken.address
    assert dex.supportedTokens(2) == coffeeToken.address

    assert dex.tokenAddressToName(dex.supportedTokens(0)) == 'WheatToken'
    assert dex.tokenAddressToName(dex.supportedTokens(1)) == 'RiceToken'
    assert dex.tokenAddressToName(dex.supportedTokens(2)) == 'CoffeeToken'
    

def test_ethTokTokenSwap(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '1000 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '1000 ether', {'from':accounts[0]})
    dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '100 ether'})
    
    dex.liquidityPoolToAvailableLiquidity(WETH, wheatToken.address)

    val = dex.ethToToken(wheatToken.address, {'from':accounts[0], 'value':'10 ether'})



def test_tokenToETH(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '1000 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '1000 ether', {'from':accounts[0]})
    dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '100 ether'})

    #print('initial token blance ' + str(wheatToken.balanceOf(accounts[0])) )
    #print('initial eth blance ' + str(accounts[0].balance()) )

    val = dex.tokenToEth(wheatToken.address, '10 ether', {'from':accounts[0]})

    
    #print('Final token blance ' + str(wheatToken.balanceOf(accounts[0])) )
    #print('Final eth blance ' + str(accounts[0].balance()) )

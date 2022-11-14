from brownie import web3, accounts, reverts
from math import isclose


def test_addLiquidityEth_initPool_mappings(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '1000 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '1000 ether', {'from':accounts[0]})

    initTx = dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '100 ether'})

    # checking contract balances
    assert dex.balance() == web3.toWei(100, 'ether')
    assert wheatToken.balanceOf(dex.address) == initTx.return_value

    # checking mappings
    assert dex.tokenAddressToLiquidity(WETH) == web3.toWei(100, 'ether')
    assert dex.tokenAddressToLiquidity(wheatToken.address) == initTx.return_value

    assert dex.liquidityProviderToLiquidityProvided(accounts[0], WETH) == web3.toWei(100, 'ether')
    assert dex.liquidityProviderToLiquidityProvided(accounts[0], wheatToken.address) == initTx.return_value

    assert dex.liquidityPoolToAvailableLiquidity(WETH, wheatToken.address) == (web3.toWei(100, 'ether'), initTx.return_value)


def test_addLiquidityEth_initPool_functionality(wheatToken, riceToken, coffeeToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '1000 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '1000 ether', {'from':accounts[0]})

    riceToken.mint(accounts[0], '10000 ether', {'from':accounts[0]})
    riceToken.approve(dex.address, '10000 ether', {'from':accounts[0]})

    coffeeToken.mint(accounts[0], '1000 ether', {'from':accounts[0]})
    coffeeToken.approve(dex.address, '1000 ether', {'from':accounts[0]})

    initTx_wheat = dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from':accounts[0], 'value': '100 ether'})
    print('ETH given for Wheat: 100 ehter')
    print('Wheat Token to give: ' + str(initTx_wheat.return_value))

    initTx_rice = dex.addLiquidityETH(riceToken.address, 1207.593, 17.491, {'from':accounts[0], 'value': '10 ether'})
    print('ETH given for Rice: 10 ehter')
    print('Rice Token to give: ' + str(initTx_rice.return_value))

    initTx_coffee = dex.addLiquidityETH(coffeeToken.address, 1207.593, 1851.851, {'from':accounts[0], 'value':'100 ether'})
    print('ETH given for Coffee: 100 ehter')
    print('Coffee Token to give: ' + str(initTx_coffee.return_value))

    assert dex.tokenAddressToLiquidity(WETH) == web3.toWei(210, 'ether')
    assert dex.tokenAddressToLiquidity(wheatToken.address) == initTx_wheat.return_value
    assert dex.tokenAddressToLiquidity(riceToken.address) == initTx_rice.return_value
    assert dex.tokenAddressToLiquidity(coffeeToken.address) == initTx_coffee.return_value

    assert dex.liquidityPoolToAvailableLiquidity(WETH, wheatToken.address) == (web3.toWei(100, 'ether'), initTx_wheat.return_value)
    assert dex.liquidityPoolToAvailableLiquidity(WETH, riceToken.address) == (web3.toWei(10, 'ether'), initTx_rice.return_value)
    assert dex.liquidityPoolToAvailableLiquidity(WETH, coffeeToken.address) == (web3.toWei(100, 'ether'), initTx_coffee.return_value)


def test_addLiquidityEth_noEth(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '1000 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '1000 ether', {'from':accounts[0]})

    with reverts():
        dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '0 ether'})

    assert dex.liquidityPoolToAvailableLiquidity(WETH, wheatToken.address) == (0,0)

def test_addLiquidityEth_noToken(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '10 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '10 ether', {'from':accounts[0]})

    with reverts():
        dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '100 ether'})

    assert dex.liquidityPoolToAvailableLiquidity(WETH, wheatToken.address) == (0,0)

def test_addLiquidityEth_noApproval(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '100 ether', {'from':accounts[0]})

    with reverts():
        dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '100 ether'})

    assert dex.liquidityPoolToAvailableLiquidity(WETH, wheatToken.address) == (0,0)

def test_addLiquidityEth_existingPool(wheatToken, dex):
    WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    wheatToken.mint(accounts[0], '10000 ether', {'from':accounts[0]})
    wheatToken.approve(dex.address, '10000 ether', {'from':accounts[0]})

    initTx = dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '100 ether'})

    addTx = dex.addLiquidityETH(wheatToken.address, 1207.593, 329.003, {'from': accounts[0], 'value': '300 ether'})
    
    assert dex.tokenAddressToLiquidity(WETH) == web3.toWei(400, 'ether')
    assert dex.tokenAddressToLiquidity(wheatToken.address) == initTx.return_value + addTx.return_value

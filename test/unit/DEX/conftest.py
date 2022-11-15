import pytest

@pytest.fixture(scope='function', autouse=True)
def isolate(fn_isolation):
    # perform a chain rewind after completing each test, to ensure proper isolation
    # https://eth-brownie.readthedocs.io/en/v1.10.3/tests-pytest-intro.html#isolation-fixtures
    pass

@pytest.fixture(scope='module')
def wheatToken(WheatToken, accounts):
    return WheatToken.deploy({'from':accounts[0]})

@pytest.fixture(scope='module')
def riceToken(RiceToken, accounts):
    return RiceToken.deploy({'from':accounts[0]})

@pytest.fixture(scope='module')
def coffeeToken(CoffeeToken, accounts):
    return CoffeeToken.deploy({'from':accounts[0]})

@pytest.fixture(scope='module')
def dex(DEX, accounts):
    # tested this approach it works
    dex = DEX.deploy({'from':accounts[0]})
    # wheatToken.transferOwnership(dex.address, {'from':accounts[0]})
    # riceToken.transferOwnership(dex.address, {'from':accounts[0]})
    # coffeeToken.transferOwnership(dex.address, {'from':accounts[0]})
    return dex

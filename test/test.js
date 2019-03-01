require('dotenv').config()
const expect = require('chai').expect
const uuid = require('uuid')
const Ledger = require('../src/index')

describe('Ledger primary tests', function () {
  this.timeout(10000000)

  const DISTRIBUTION_ACCOUNT = process.env.DISTRIBUTION_ACCOUNT
  const TRUST_ACCOUNT = process.env.TRUST_ACCOUNT
  const LEDGER_ACCOUNT = process.env.LEDGER_ACCOUNT
  const TEST_WALLET = process.env.TEST_WALLET
  const TEST_EMPTY_WALLET = process.env.TEST_EMPTY_WALLET

  let ledger = {}

  before(function () {
    const config = {
      httpEndpoint: process.env.HTTP_ENDPOINT,
      chainId: process.env.CHAIN_ID
      // keyProvider: process.env.KEY_PROVIDER
    }
    ledger = new Ledger(config, LEDGER_ACCOUNT)
  })

  it('Retrieves a balance from account', async function () {
    const balance = await ledger.retrieveBalance({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    })
    console.log('Account balance:', balance)
    expect(balance)
      .to.have.a.property('amount')
      .that.is.a('number')
      .that.is.above(0)
    expect(balance)
      .to.have.a.property('currency')
      .that.equals('VTX')
  })

  it('Retrieves a balance with empty parameters', async function () {
    const balance = await ledger.retrieveBalance({
      account: '',
      wallet: ''
    })
    console.log('Account balance with empty parameters:', balance)
    expect(balance)
      .to.have.a.property('amount')
      .that.is.a('number')
      .that.equals(0)
    expect(balance)
      .to.have.a.property('currency')
      .that.equals('VTX')
  })

  it('Retrieves a balance from wallet', async function () {
    const balance = await ledger.retrieveBalance({
      account: DISTRIBUTION_ACCOUNT,
      wallet: TEST_WALLET
    })
    console.log(balance)
    expect(balance)
      .to.have.a.property('amount')
      .that.is.a('number')
      .that.is.above(0)
    expect(balance)
      .to.have.a.property('currency')
      .that.equals('VTX')
  })

  it('Retrieves zero transactions from a new wallet', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_EMPTY_WALLET
    })
    console.log('Transactions empty:', transactions.transactions.length)
    expect(transactions)
      .to.have.property('transactions')
      .which.is.an('array')
      .lengthOf(0)
  })

  it('Retrieves transactions from a wallet', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    })
    console.log('Transactions:', transactions.transactions.length)
    expect(transactions)
      .to.have.property('transactions')
      .which.is.an('array')
      .lengthOf(5)
  })

  it('Retrieves 1 transaction from a wallet when requesting only 1', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET,
      limit: 1
    })
    expect(transactions)
      .to.have.property('transactions')
      .which.is.an('array')
      .lengthOf(1)
  })

  it('Retrieves 2 transactions from a wallet when requesting only 2', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET,
      limit: 2
    })
    expect(transactions)
      .to.have.property('transactions')
      .which.is.an('array')
      .lengthOf(2)
  })

  // TODO
  // it("retrieves a transaction with a block number", async function() {
  //   const testAmount = getRandomInt(1, 100);
  //   const newTestWallet = uuid();
  //   await ledger.recordTransfer({
  //     from: {
  //       account: DISTRIBUTION_ACCOUNT
  //     },
  //     to: {
  //       account: TRUST_ACCOUNT,
  //       wallet: newTestWallet
  //     },
  //     amount: testAmount
  //   });

  //   const transactions = await ledger.retrieveTransactions({
  //     account: TRUST_ACCOUNT,
  //     wallet: newTestWallet
  //   });

  //   expect(transactions.transactions[0].blockNumber)
  //     .to.be.a("number")
  //     .which.is.greaterThan(1000);
  // });

  async function getTestWalletBalance () {
    const balance = await ledger.retrieveBalance({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    })
    return balance.amount
  }

  async function getDistributionAccountBalance () {
    const balance = await ledger.retrieveBalance({
      account: DISTRIBUTION_ACCOUNT
    })
    return balance.amount
  }

  async function clearTestWallet() {
    // Move any balance from the trust account back to the distribution account
    const balance = await ledger.retrieveBalance({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    })
  }

  async function clearTestWallet() {
    const balance = await ledger.retrieveBalance({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    })
    if (balance.amount === 0) {
      return Promise.resolve()
    }
    return ledger.recordTransfer({
      from: {
        account: TRUST_ACCOUNT,
        wallet: TEST_WALLET
      },
      to: {
        account: DISTRIBUTION_ACCOUNT
      },
      amount: balance.amount
    })
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
})

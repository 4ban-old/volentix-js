require('dotenv').config()
const expect = require('chai').expect
const uuid = require('uuid')
const Ledger = require('../src/index')

describe('Common tests', function () {
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

})

describe('Wallet tests', function () {
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

  it('Retrieves transactions from a new or empty wallet', async function () {
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

  it('Retrieves a transaction with a block number', async function() {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    });
    console.log("Block number:", transactions.transactions[0].Id)
    expect(transactions.transactions[0].Id)
      .to.be.a('number')
      .which.is.greaterThan(1);
  });

  // async function getTestWalletBalance () {
  //   const balance = await ledger.retrieveBalance({
  //     account: TRUST_ACCOUNT,
  //     wallet: TEST_WALLET
  //   })
  //   return balance.amount
  // }

  // async function getDistributionAccountBalance () {
  //   const balance = await ledger.retrieveBalance({
  //     account: DISTRIBUTION_ACCOUNT
  //   })
  //   return balance.amount
  // }
})

describe('Account tests', function () {
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
      wallet: ''
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

})

require('dotenv').config()
const Ledger = require('../src/index')

const DISTRIBUTION_ACCOUNT = process.env.DISTRIBUTION_ACCOUNT
const TRUST_ACCOUNT = process.env.TRUST_ACCOUNT
const LEDGER_ACCOUNT = process.env.LEDGER_ACCOUNT
const TEST_WALLET = process.env.TEST_WALLET
const TEST_EMPTY_WALLET = process.env.TEST_EMPTY_WALLET

describe('Common tests', function () {
  let ledger = {}
  let timeout = 5000

  beforeAll(() => {
    const config = {
      httpEndpoint: process.env.HTTP_ENDPOINT,
      chainId: process.env.CHAIN_ID
    }
    ledger = new Ledger(config, LEDGER_ACCOUNT)
  })

  test('Retreive a balance with empty parameters', async () => {
    const balance = await ledger.retrieveBalance({
      account: '',
      wallet: ''
    })
    // console.log('Account balance with empty parameters:', balance)
    expect(balance).toHaveProperty('amount', 0)
    expect(balance).toHaveProperty('currency', 'VTX')
  }, timeout)
})

describe('Wallet tests', function () {
  let ledger = {}
  let timeout = 5000

  beforeAll(function () {
    const config = {
      httpEndpoint: process.env.HTTP_ENDPOINT,
      chainId: process.env.CHAIN_ID
    }
    ledger = new Ledger(config, LEDGER_ACCOUNT)
  })

  test('Retrieves a balance from wallet', async function () {
    const balance = await ledger.retrieveBalance({
      account: DISTRIBUTION_ACCOUNT,
      wallet: TEST_WALLET
    })
    // console.log(balance)
    expect(balance).toHaveProperty('amount')
    expect(balance).toHaveProperty('currency', 'VTX')
    expect(balance.amount).toBeGreaterThan(0)
  }, timeout)

  test('Retrieves transactions from a new or empty wallet', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_EMPTY_WALLET
    })
    // console.log('Transactions empty:', transactions.transactions.length)
    expect(transactions).toHaveProperty('transactions')
    expect(transactions.transactions.length).toEqual(0)
  }, timeout)

  test('Retrieves transactions from a wallet', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    })
    // console.log('Transactions:', transactions.transactions.length)
    expect(transactions).toHaveProperty('transactions')
    expect(transactions.transactions.length).toBeGreaterThan(0)
  }, timeout)

  test('Retrieves 1 transaction from a wallet when requesting only 1', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET,
      limit: 1
    })
    expect(transactions).toHaveProperty('transactions')
    expect(transactions.transactions.length).toEqual(1)
  }, timeout)

  test('Retrieves 2 transactions from a wallet when requesting only 2', async function () {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET,
      limit: 2
    })
    expect(transactions).toHaveProperty('transactions')
    expect(transactions.transactions.length).toEqual(2)
  }, timeout)

  test('Retrieves a transaction with a block number', async function() {
    const transactions = await ledger.retrieveTransactions({
      account: TRUST_ACCOUNT,
      wallet: TEST_WALLET
    });
    // console.log("Block number:", transactions.transactions[0].Id)
    expect(transactions.transactions[0].Id).toBeGreaterThan(1)
  }, timeout)

//   // async function getTestWalletBalance () {
//   //   const balance = await ledger.retrieveBalance({
//   //     account: TRUST_ACCOUNT,
//   //     wallet: TEST_WALLET
//   //   })
//   //   return balance.amount
//   // }

//   // async function getDistributionAccountBalance () {
//   //   const balance = await ledger.retrieveBalance({
//   //     account: DISTRIBUTION_ACCOUNT
//   //   })
//   //   return balance.amount
//   // }
})

describe('Account tests', function () {
  let ledger = {}
  let timeout = 5000

  beforeAll(function () {
    const config = {
      httpEndpoint: process.env.HTTP_ENDPOINT,
      chainId: process.env.CHAIN_ID
    }
    ledger = new Ledger(config, LEDGER_ACCOUNT)
  })

  test('Retrieves a balance from account', async function () {
    const balance = await ledger.retrieveBalance({
      account: TRUST_ACCOUNT,
      wallet: ''
    })
    // console.log('Account balance:', balance)
    expect(balance).toHaveProperty('amount')
    expect(balance.amount).toBeGreaterThan(0)
    expect(balance).toHaveProperty('currency', 'VTX')
  }, timeout)
})

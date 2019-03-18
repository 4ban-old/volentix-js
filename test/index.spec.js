require('dotenv').config()
const VEOS = require('../src/index')

const CHAIN_ID = process.env.CHAIN_ID
const TEST_HTTP_ENDPOINT = process.env.TEST_HTTP_ENDPOINT
const MAIN_HTTP_ENDPOINT = process.env.MAIN_HTTP_ENDPOINT
const TEST_LEDGER_ACCOUNT = process.env.TEST_LEDGER_ACCOUNT
const TEST_WALLET = process.env.TEST_WALLET
const TEST_EMPTY_WALLET = process.env.TEST_EMPTY_WALLET
const TEST_PRIVATE_KEY_VALID = process.env.TEST_PRIVATE_KEY_VALID
const TEST_PRIVATE_KEY_INVALID = process.env.TEST_PRIVATE_KEY_INVALID
const TEST_PUBKEY = process.env.TEST_PUBKEY

describe('TESTNET', function () {
  describe('Utilities', function () {
    let veos = {}
    let timeout = 5000

    beforeAll(() => {
      const config = {
        httpEndpoint: TEST_HTTP_ENDPOINT,
        chainId: CHAIN_ID
      }
      veos = new VEOS(config)
    })

    test('Private key is valid', async () => {
      const valid = await veos.isPrivateKeyValid(TEST_PRIVATE_KEY_VALID)
      // console.log('Valid private key:', valid)
      expect(valid).toEqual(true)
    }, timeout)

    test('Private key is invalid', async () => {
      const valid = await veos.isPrivateKeyValid(TEST_PRIVATE_KEY_INVALID)
      // console.log('Invalid private key:', valid)
      expect(valid).toEqual(false)
    }, timeout)

    test('From private to public', async () => {
      const pubKey = await veos.privateToPublic(TEST_PRIVATE_KEY_VALID)
      // console.log('Public key:', pubKey)
      expect(pubKey).toEqual('EOS8kJexf4qWCXaF6bfssF5HBaASRrr3NGW2PmERC6WDUafRc1FKn')
    }, timeout)

    test('Get accounts from public key', async () => {
      const accounts = await veos.getAccountsFromKey(TEST_PUBKEY)
      let account = accounts.account_names[0]
      // console.log('Accounts:', account)
      expect(account).toEqual('volentixrhys')
    }, timeout)
  })
  describe('Account balance', function () {
    let veos = {}
    let timeout = 5000

    beforeAll(() => {
      const config = {
        httpEndpoint: TEST_HTTP_ENDPOINT,
        chainId: CHAIN_ID
      }
      veos = new VEOS(config)
    })

    test('Retreive an EOS balance for volentixrhys. Specify contract name', async () => {
      const balance = await veos.getAccountBalance(
        'volentixrhys',
        'eosio.token'
      )
      let amount = parseFloat(balance[0].split(' ')[0])
      let currency = balance[0].split(' ')[1]
      // console.log('Account balance:', balance[0].split(' ')[0])
      expect(amount).toBeGreaterThan(0)
      expect(currency).toEqual('EOS')
    }, timeout)

    test('Retreive an EOS balance for volentixrhys. Without contract name', async () => {
      const balance = await veos.getAccountBalance(
        'volentixrhys'
      )
      let amount = parseFloat(balance[0].split(' ')[0])
      let currency = balance[0].split(' ')[1]
      // console.log('Account balance:', balance[0].split(' ')[0])
      expect(amount).toBeGreaterThan(0)
      expect(currency).toEqual('EOS')
    }, timeout)

    test('Retreive an VTX balance for volentixrhys.', async () => {
      const balance = await veos.getAccountBalance(
        'volentixrhys',
        'volentixgsys'
      )
      let amount = parseFloat(balance[0].split(' ')[0])
      let currency = balance[0].split(' ')[1]
      // console.log('Account balance:', balance[0].split(' ')[0])
      expect(amount).toBeGreaterThan(0)
      expect(currency).toEqual('VTX')
    }, timeout)
  })
})

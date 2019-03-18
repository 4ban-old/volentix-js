var eos = require('eosjs')
const { ecc } = eos.modules
const moment = require('moment')
const uuid = require('uuid')

class VEOS {
  constructor (config) {
    this.eos = eos(
      Object.assign({}, config, {
        expireInSeconds: 60,
        verbose: false,
        debug: false,
        sign: true,
        // authorization: this.LEDGER_ACCOUNT_NAME + '@active'
      })
    )
  }
  async isPrivateKeyValid (privateKey) {
    return await ecc.isValidPrivate(privateKey) === true
  }

  async privateToPublic (privateKey) {
    return await ecc.privateToPublic(privateKey)
  }

  async getAccountsFromKey (publicKey) {
    // return await this.eos.getKeyAccounts(publicKey)
    return new Promise((resolve, reject) => {
      this.eos.getKeyAccounts(publicKey, (error, result) => {
        if (error) reject(error)
        resolve(result)
      })
    })
  }

  async getAccountBalance (accountName, contractName = 'eosio.token') {
    // return await this.eos.getCurrencyBalance(contractName, accountName)
    return new Promise((resolve, reject) => {
      this.eos.getCurrencyBalance(contractName, accountName, (error, result) => {
        if (error) reject(error)
        resolve(result)
      })
    })
  }
}

module.exports = VEOS

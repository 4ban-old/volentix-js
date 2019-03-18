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
        sign: true
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

  async transferToken(contractName = 'eosio.token', from, to, quantity, memo = '', keyProvider) {
    const tr = await this.eos.transaction({
      actions: [{
        account: contractName,
        name: 'transfer',
        authorization: [{
          actor: from,
          permission: 'active'
        }],
        data: {
          from: from,
          to: to,
          quantity: quantity,
          memo: memo
        }
      }]
    }, { keyProvider })
    return tr.transaction
  }


}

module.exports = VEOS

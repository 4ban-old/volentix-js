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

  async transferToken (contractName = 'eosio.token', from, to, quantity, memo = '', keyProvider) {
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

  async getTransactions (accountName) {
    return new Promise(async (resolve, reject) => {
      const trx = []
      const actions = (await this.eos.getActions(accountName)).actions
      // in case you solely want the standard transactions
      // .filter(a => a.action_trace.act.name === 'transfer')
      // actions.filter(a => a.action_trace.act.name === 'transfer')
      actions.map(a => {
        const { from, memo, quantity, to, payer, quant, receiver } = a.action_trace.act.data
        const { bytes, stake_cpu_quantity: stakeCpuQuantity, stake_net_quantity: stakeNetQuantity, transfer } = a.action_trace.act.data
        const { name, data } = a.action_trace.act
        let obj = {}
        if (name === 'transfer') {
          obj = {
            ...obj,
            to,
            from,
            quantity: this.toFloat(quantity),
            memo
          }
        } else if (name === 'buyram') obj = {
          ...obj,
          payer,
          quant: this.toFloat(quant),
          receiver
        }
        else if (name === 'buyrambytes') obj = {
          ...obj,
          payer,
          receiver,
          bytes
        }
        else if (name === 'delegatebw') {
          obj = {
            ...obj,
            stake_cpu_quantity: this.toFloat(stakeCpuQuantity), // unit in EOS
            stake_net_quantity: this.toFloat(stakeNetQuantity), // unit in EOS
            transfer
          }
        } else if (name === 'newaccount') {
          obj = {
            ...obj,
            creator: data.creator,
            name: data.name,
            key: data.active.keys[0].key
          }
        } else {
          // https://eosio.stackexchange.com/questions/1831/getactionsaccountname-possible-names-actions-action-trace-act-name?noredirect=1#comment1698_1831
          // if not any of the mainly used transaction types, return whole object
          return actions
        }
        obj = {
          ...obj,
          transaction_ID: a.action_trace.trx_id,
          block_time: a.block_time,
          block_num: a.block_num,
          trx_type: name
        }
        trx.push(obj)
        return a.action_trace.act
      })
      // console.log(trx);
      // console.log(actions);  //unfiltered data;
      resolve(trx)
    })
  }

}

module.exports = VEOS

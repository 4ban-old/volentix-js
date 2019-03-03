var eos = require('eosjs')
const moment = require('moment')
const uuid = require('uuid')

const BOILERPLATE_ASSERTION_TEXT = 'assertion failure with message: '

class Ledger {
  constructor (config, accountName) {
    this.LEDGER_ACCOUNT_NAME = accountName
    this.TREASURY_ACCOUNT_NAME = 'vtxtreasury'

    this.eos = eos(
      Object.assign({}, config, {
        expireInSeconds: 60,
        verbose: false,
        debug: false,
        sign: true,
        authorization: this.LEDGER_ACCOUNT_NAME + '@active'
      })
    )
  }

  async retrieveBalance ({ account, wallet }) {
    var amount = 0.0
    var ub = 0
    var lb = 0
    var flag = true
    var counter = 1

    while (flag) {
      ub = counter * 1000
      lb = ub - 1000
      var output = await this.eos.getTableRows({
        code: this.LEDGER_ACCOUNT_NAME,
        scope: this.LEDGER_ACCOUNT_NAME,
        table: 'entry',
        json: true,
        limit: 1000,
        upper_bound: ub,
        lower_bound: lb
      })
      if (Object.keys(output.rows).length == 0) {
        flag = false
      }
      for (var i = 0; i < Object.keys(output.rows).length; i++) {
        if (wallet === '' && account === '') {
          break
        }
        if (wallet === '') {
          if (output.rows[i].fromAccount.localeCompare(account) == 0) {
            amount += parseFloat(output.rows[i].amount)
          }
          if (output.rows[i].toAccount.localeCompare(account) == 0) {
            amount += parseFloat(output.rows[i].amount)
          }
        } else {
          if (output.rows[i].sToKey.localeCompare(wallet) == 0) {
            amount += parseFloat(output.rows[i].amount)
          }
        }
      }
      counter++
    }
    return {
      amount,
      currency: 'VTX'
    }
    vtxledger, vtxledger, entry
  }

  async recordTransfer ({ from, to, amount, comment }) {
    const contract = await this.eos.contract(this.LEDGER_ACCOUNT_NAME)

    const submittedAt = new Date()
    try {
      const transfer = await contract.rcrdtfr({
        nonce: uuid(),
        s: this.TREASURY_ACCOUNT_NAME,
        fromaccount: from.account,
        toaccount: to.account,
        fromkey: from.wallet ? from.wallet : '',
        tokey: to.wallet ? to.wallet : '',
        amount,
        comment: comment ? comment : ''
      })
      // console.log("recordTransfer: ", JSON.stringify(transfer, null, 2))
      return {
        from,
        to,
        amount,
        submittedAt: moment(submittedAt).format(),
        id: transfer.processed.id,
        currency: 'VTX', // TODO Should be returned from server
        comment
      }
    } catch (eStr) {
      const e = JSON.parse(eStr)
      // { "code": 500, "message": "Internal Service Error", "error": { "code": 3050003, "name": "eosio_assert_message_exception", "what": "eosio_assert_message assertion failure", "details": [{ "message": "assertion failure with message: insufficient_funds", "file": "wasm_interface.cpp", "line_number": 930, "method": "eosio_assert" }, { "message": "pending console output: Wallet to account", "file": "apply_context.cpp", "line_number": 61, "method": "exec_one" }] } }

      if (
        e.error &&
        e.error.details &&
        e.error.details[0] &&
        e.error.details[0].message &&
        e.error.details[0].message.startsWith(BOILERPLATE_ASSERTION_TEXT)
      ) {
        e.name = e.error.details[0].message.slice(
          BOILERPLATE_ASSERTION_TEXT.length
        )
      }
      throw e
    }
  }
  // Retrieve all transactions performed from / to this account & wallet
  async retrieveTransactions ({ account, wallet, limit }) {
    var ub = 0
    var lb = 0
    var transactions = []
    var flag = true
    var counter = 1
    while (flag) {
      ub = counter * 1000
      lb = ub - 1000

      var output = await this.eos.getTableRows({
        code: this.LEDGER_ACCOUNT_NAME,
        scope: this.LEDGER_ACCOUNT_NAME,
        table: 'entry',
        json: true,
        limit: 1000,
        upper_bound: ub,
        lower_bound: lb
      })
      // console.log("lap: ", transactions.length);
      if (Object.keys(output.rows).length == 0) {
        flag = false
      }

      for (var i = 0; i < Object.keys(output.rows).length; i++) {
        if (wallet === '') {
          if (output.rows[i].fromAccount.localeCompare(account) == 0) {
            transactions.push(output.rows[i]);
          }
          if (output.rows[i].toAccount.localeCompare(account) == 0) {
            transactions.push(output.rows[i]);
          }
        } else {
          if (output.rows[i].sToKey.localeCompare(wallet) == 0) {
            transactions.push(output.rows[i]);
          }
          // if (output.rows[i].fromKey.localeCompare(wallet) == 0) {
          //   transactions.push(output.rows[i]);
          // }
        }
      }
      transactions.splice(0, Object.keys(transactions).length - limit)
      counter++
    }
    // console.log("Size:", transactions.length);
    return {
      transactions
    }
    vtxledger, vtxledger, entry
  }
}

module.exports = Ledger

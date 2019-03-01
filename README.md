# vlabs-ledger-js

[![Waffle.io - Columns and their card count](https://badge.waffle.io/Volentix/verto.svg?columns=all)](https://waffle.io/Volentix/verto)

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)](https://choosealicense.com/licenses/mit/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Open Source Love](https://badges.frapsoft.com/os/v3/open-source.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)

> A javascript client library for Volentix Ledger

This client allows full access for Javascript applications to the contracts provided by the Volentix
ledger. In summary, those are:

- Transfer funds from one account / wallet to another
- Get the balance of an account / wallet
- Get a list of transactions from / to any account / wallet

The ledger is a record of the amount of funds a user holds. Before
tokens are created, the record consists of entries in a database. After tokens are created, the record is a
quantity of actual tokens. This javascript API conceals the differences between the two, providing a single
interface for applications like [Verto](https://github.com/Volentix/verto) to obtain balance information.

Throughout this document, usage of the word "tokens" can mean either actual tokens, or a record of tokens which
are owed after they are created. A user of this package sees no difference between either of these.

Some terminology:

- **Account**: Accounts are defined by EOS and identified by a 1-12 character name.
- **Distribution account**: The account which holds tokens to be distributed. For VTX, this is `vtxdistrib`
- **Trust account** A specific account which holds funds _in trust_ for a user. By holding funds, users
  can earn VTX without requiring them to open an EOS account (at a cost of ~$10 each). For VTX, this is `vtxtrust`.
- **Wallet**: Users create EOS wallets (for example [Verto](https://github.com/Volentix/verto)) to uniquely
  identify the tokens that they are owed

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Development](#development)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

First add the ledger client to your application:

`npm add volentix-ledger`

You must have access to an EOS instance with the [Volentix Ledger](https://github.com/Volentix/ledger)
contracts deployed. Please see that project for deployment of the contracts.

## Usage

```javascript
import Ledger from "volentix-ledger";

// Point to a specific instance of the Ledger
const ledger = new Ledger({
  httpEndpoint: "https://url-of-eos-node", // URL of EOS node
  chainId: "cf057bbfb72640471ff8a%90ba539c22df9f92470936cddc1ade0e2f2e7dc4f", // ID of a chain containing Volentix ledger
  keyProvider: "EOS8TJpbWeQEoaMZMZzmo4SqC7DUucEUHRQJs1x7cXLcTqRhiJ7VF" // EOS account with the ledger contracts
});

// Retrieve the balance
const balance = await ledger.retrieveBalance({
  account: "vtxtrust", // the ID of an account
  wallet: "EOS5vBqi8YSzFCeTv4weRTwBzVkGCY5PN5Hm1Gp3133m8g9MtHTbW" // the public key of an EOS wallet
});

console.log(`You have ${balance.amount} ${balance.currency}`);
```

Also available in the `test` directory is a `mock-ledger.js` which can be used for basic testing without needing
to connect to a remote instance.

## API

### `constructor`

The constructor parameters are the same as those described in [eosjs configuration](https://github.com/EOSIO/eosjs#configuration).

You should pass at least these fields:

- `httpEndpoint`: http or https location of a nodeosd server providing a chain API.
- `chainId`: Unique ID for the blockchain you're connecting to.
- `keyProvider`: The EOS account which contains the Ledger contracts.

### `retrieveBalance`

Retrieve the balance of an account or wallet.

#### Example

To retrieve a user's balance held in the trust account:

```javascript
const balance = await ledger.retrieveBalance({
  account: "vtxtrust", // the ID of an account
  wallet: "EOS5vBqi8YSzFCeTv4weRTwBzVkGCY5PN5Hm1Gp3133m8g9MtHTbW" // the public key of an EOS wallet
});

console.log(`You have ${balance.amount} ${balance.currency}`);
```

or to retrieve the balance of the entire distribution account:

```javascript
const balance = await ledger.retrieveBalance({
  account: "vtxdistrib" // the ID of an account
});

console.log(`You have ${balance.amount} ${balance.currency}`);
```

### `retrieveTransactions`

Retrieve all transactions associated with this account / wallet. Because we only support
funds transfers at the moment, the list will only include transfers, but in the future
there may be other types of transactions

- `transactions`: A list of the transactions found
  - `id`: The ID of a transaction
  - `blockNum`: The block number where the transaction was recorded
  - `from`: Where funds were transferred from
    - `account`: The 1-12 character name of the EOS account to transfer funds FROM
    - `wallet` (optional): The owner public key of the user's wallet
  - `to`: Where funds were transferred to
    - `account`: The 1-12 character name of the EOS account to transfer funds TO
    - `wallet` (optional): The owner public key of the user's wallet
  - `amount`: The amount of funds transferred
  - `currency`: The currency used in this account / wallet
  - `submittedAt`: The date and time that the transaction was submitted, in ISO 8601 format
  - `comment`: Text supplied when transaction was performed

#### Example

To retrieve all the transactions associated with a user's wallet

```javascript
const transactions = await ledger.retrieveTransactions({
  account: "vtxtrust", // the ID of an account
  wallet: "EOS5vBqi8YSzFCeTv4weRTwBzVkGCY5PN5Hm1Gp3133m8g9MtHTbW" // the public key of an EOS wallet
});

transactions.transactions.forEach(tx => {
  console.log(
    `[ID: ${tx.id}] Found ${tx.type} from ${tx.from.account} to ${
      tx.to.account
    }`
  );
  if (tx.from.wallet) console.log(`From wallet ${tx.from.wallet}`);
  if (tx.to.wallet) console.log(`To wallet ${tx.to.wallet}`);
});
```

### `recordTransfer`

Add a transfer from one account / wallet to another.

Data to pass in:

- `from`: The location to transfer funds from
  - `account`: The 1-12 character name of the EOS account to transfer funds FROM
  - `wallet` (optional): The owner public key of the user's wallet
- `to`: The location to transfer funds from
  - `account`: The 1-12 character name of the EOS account to transfer funds TO
  - `wallet` (optional): The owner public key of the user's wallet
- `amount`: The amount of funds to transfer
- `comment`: (optional) Text for details about the transfer

Returns all of the given data, plus:

- `id`: The unique ID of the transfer
- `currency`: The currency used in this account / wallet
- `submittedAt`: The date and time that the transaction was submitted, in ISO 8601 format

#### Example

For this example, record a transfer from the distribution account to a user's wallet held
in the trust account:

```javascript
const transfer = await recordTransfer({
  from: {
    account: "vtxdistrib"
  },
  to: {
    account: "vtxtrust",
    wallet: "EOS5vBqi8YSzFCeTv4weRTwBzVkGCY5PN5Hm1Gp3133m8g9MtHTb"
  },
  amount: 123.45
});

console.log(
  `Transfer of ${transfer.balance} ${transfer.currency} completed; ID: ${
    transfer.id
  }`
);
```

## Development

### Testing

**Config**

Create a `.env` file in the root directory and set these variables:

```
# The chain id of your running instance
CHAIN_ID=

# The EOS account which contains the Ledger contracts.
KEY_PROVIDER=

# http or https location of a nodeosd server providing a chain API.
HTTP_ENDPOINT=

http or https location of a nodeosd server providing the wallet API.
WALLET_ENDPOINT=
```

The test framework will read these values and pass them to the ledger client

**NPM**

Install the dependencies.

```
npm install
```

**Run The Tests**

You can run the tests with the following command.

```
npm run test
```

## Maintainers

- [@sylvaincormier](https://github.com/sylvaincormier)
- [@shawnlauzon](https://github.com/shawnlauzon)
- [@realrhys](https://github.com/realrhys)

## Contribute

See [the contribute file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2018 Volentix Labs Inc.

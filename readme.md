# Wallchain Savings SDK

The savings SDK allows to give permissions to Wallchain API to do auto-depositing and
auto-withdrawing of funds to some yielding protocols.

## Definitions

- EOA (External Owned Address) - "normal" web3 address, controller by private key.
- AA address (Account Abstraction) - ERC4337 contract address, that works similar to EOA address,
  but allows additional features, like allowing others to execute some specific actions on behalf
  of AA.
- AA Owner - EOA address that created AA smart contract. This address can execute any transaction on
  behalf of AA by signing it.
- Session Key - special message, signed by owner of AA, that allows another EOA to execute specific
  transactions on behalf of AA. What exactly can be done is defined by Session Key permissions.
- Vault - a smart contracts which allows depositing of funds to get interest-based profit.
- Deposit Strategy - an abstract entity that defines how a specific token in a particular chain can be deposited to a specific protocol.
  Think of it as a `<ChainId, TokenAddress, Vault>` tuple. It also carries the necessary permissions to do its job.

## How Wallchain API works

For each registered user, Wallchain algorithms decide the moment to deposit (or withdraw) the user's money
to some Vault. To be able to do so, funds should be on some AA address, and Wallchain should
have correct Session Key to execute this specific transactions.

So, to when you use SDK always control some AA address and create, sign and provide Session Key to
Wallchain API.

## SDK Usage

### Initialization

To start using SDK, you should initialize `SavingsAccount` class. To do so, you can do the following:

#### Initialize SDK if you do not have AA address

In this case, SDK will create AA address for you. Just provide standard `Viem`s `PrivateKeyAccount`:

```ts
const privateKeyAccount: PrivateKeyAccount = ...;

const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
  privateKeyAccount: account,
  chainId: 8453,
  savingsBackendUrl: 'https://api.wallchains.com',
  bundlerChainAPIKey: 'key-1',
  sponsorshipAPIKey: 'key-2',
});
```

Calling this function will automatically setup an AA address. The AA smart contract will be deployed
during execution of first action on behalf of this contract.

**Important** Only funds that are at `savingsAccount.aaAddress` address will be auto deposited. You
should manually transfer funds to this address.

#### Initialize SDK if you already have AA address

In this case, use `createSavingsAccountFromSudoValidator`. Note that only ZeroDev's `KernelValidator`
based AA contract is supported at this moment:

```ts
const privateKeyAccount: PrivateKeyAccount = ...;
const sudoValidator: KernelValidator = ...;


const savingsAccount = await createSavingsAccountFromSudoValidator({
  privateKeyAccount: privateKeyAccount,
  sudoValidator: sudoValidator,
  chainId: 8453,
  privateKeyAccount: account,
  savingsBackendUrl: 'https://api.wallchains.com',
  bundlerChainAPIKey: 'key-1',
  sponsorshipAPIKey: 'key-2',
})
```

### Login into Wallchain API

Before calling any other method, the user should log into the API. This is done to track the address
to do auto-depositing, and to track who owns the SKA account. To login, do the following:

```ts
await savingsAccount.auth();
```

This code will register the user (or login if user already exists) and store authorization token
inside SDK to do subsequent requests.

### Enabling Auto-Depositing

To allow API to do auto-depositing, you should generate Session Key with proper permissions. Generation
of it allows fine-grained control over permissions - you can enable only the Deposit Protocol you trust, only
for tokens you want to be auto-deposited. The following code enables all protocols supported by API:

```ts
const strategiesIds = getSupportedDepositStrategies().map(it => it.id);
await savingsAccount.activateStrategies(strategiesIds);
```

Each `DepositStrategy` (combination of Deposit Protocol + specific token on some chain) has unique id,
that is immutable. You can hardcode list of ids you whitelisted, or do some additional checks to
make sure you sign the correct permissions.

After this call auto-depositing is enabled, and API will start looking for an oportunity to auto-deposit.

You can retreive list of activated strategies by calling the following code:

```ts
const activeStrategies = await savingsAccount.getActiveStrategies(strategiesIds);
```

### Do manual Withdraw/Deposit

To withdraw funds that are currently deposited for an immediate use, do the following:

```ts
await savingsAccount.withdraw({
  amount: 123n, // in wei
  depositStrategyId: '<id of DepositStrategy to use>',
});
```

You can also manually deposit it back:

```ts
await savingsAccount.deposit({
  amount: 123n, // in wei
  depositStrategyId: '<id of DepositStrategy to use>',
});
```

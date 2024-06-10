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

In this case, use `createSavingsAccountFromAaAccount`. Note that only ZeroDev's `KernelValidator`
based AA contract is supported at this moment:

```ts
const privateKeyAccount: Pick<PrivateKeyAccount, 'address' | 'signTypedData'> = ...;
const publicClient = createPublicClient({
  transport: http(this.rpcUrl),
});
const ecdsaValidator: KernelValidator = await signerToEcdsaValidator(publicClient, {
  signer,
  entryPoint: ENTRYPOINT_ADDRESS_V06,
});
const client: KernelSmartAccount = await createKernelAccount(publicClient, {
  entryPoint: ENTRYPOINT_ADDRESS_V06,
  plugins: {
    sudo: ecdsaValidator,
  },
});
const aaAccountClient: KernelClient = createKernelAccountClient({
  entryPoint: ENTRYPOINT_ADDRESS_V06,
  account: aaAccount,
  bundlerTransport,
});
const aaAccount = new ZerodevPrimaryAAAccount({ client: aaAccountClient, publicClient, ecdsaValidator })


const savingsAccount = await createSavingsAccountFromAaAccount({
  aaAccount,
  privateKeyAccount,
  chainId: 8453,
  savingsBackendUrl: 'https://api.wallchains.com',
})
```

### Login into Wallchain API

Most ot the methods on SavingsAccount object require authentication:

- `savingsAccount.runDepositing();`
- `savingsAccount.getUser();`
- `savingsAccount.activateStrategies();`
- `savingsAccount.getCurrentActiveStrategies()`
- `savingsAccount.deactivateAllStrategies()`
- `withdraw({ pauseUntilDatetime })`

In order to perform them user should log in into the API. This is done to track the address
to do auto-depositing, and to track who owns the SKA account. To login, do the following:

```ts
const { user, token } = await savingsAccount.auth();
```

This code will register the user (or login if user already exists) and store authorization token
inside SDK to do subsequent requests.

#### Auth token

Since SDK is isomorphic (can be used on frontend or backend), it does not utilize `localStorage`.
SDK stores your authorization token in memory, which means it won't be persisted after page reload.
In order to persist session after reload you should:

- get token returned from `auth` call:

  `const { token } = await savingsAccount.auth()`

- store it (for example in localStorage):

  `localStorage.setItem(`savingsSdkToken\_${eoaAddress}`, token)`

- pass it as authorization header when initializing `SavingsAccount`:
  ````ts
      const token = localStorage.getItem(`savingsSdkToken_${eoaAddress}`);
      const savingsAccount = createSavingsAccountFromPrivateKeyAccount({
        privateKeyAccount,
        chainId,
        apiKey,
        savingsBackendUrl,
      });
      savingsAccount.setAuthToken(token);
    ```
  ````

#### Methods that don't require authentication

There are two methods on the SavingsAccount object, that don't require authentication with the Wallchain backend:

- `savingsAccount.withdraw()` _without pauseUntilDatetime param_
- `savingsAccount.deposit()`

They provide a possibility to work with strategies directly without the Wallchain backend.
Meaning without granting permissions or creating a session key account.

### Enabling Auto-Depositing

To allow API to do auto-depositing, you should generate Session Key with proper permissions. Generation
of it allows fine-grained control over permissions - you can enable only the Deposit Protocol you trust, only
for tokens you want to be auto-deposited. The following code enables all protocols supported by API:

```ts
const allStrategies = savingsAccount.strategiesManager.getStrategies();
const nonEoaStrategies = savingsAccount.strategiesManager
  .findAllStrategies({
    isEOA: false,
  })
  .map(strategy => ({ strategyId: strategy.id }));
await savingsAccount.activateStrategies({ activeStrategies: nonEoaStrategies });
```

#### Enabling EOA strategies

By default, SDK works only with tokens on the user's account abstraction address, which is different from EOA address, but strictily tied to it.
In case you prefer to hold assets of the user on EOA for all the time, you can use EOA strategies which use ERC20 approval mechanism to connect EOA and AA.
For EOA strategy to work several conditions should be met:

- allowance for a selected ERC20 token to be transferred to user's AA account should be granted
- strategy should be activated (via `savingsAccount.activateStrategies()` call)

After that ERC20 tokens will be automatically moved from user's EOA to AA account and deposited.
Once user is willing to withdraw them - they will be automatically withdrawn to user's EOA account.
To activate an EOA strategy you have to pass the user's EOA address as an additional parameter, when activating the strategy.
This way we can ensure that, when withdrawn, the tokens can only be transferred back to a specified EOA account, ensuring a high level of security.

```ts
const allStrategies = savingsAccount.strategiesManager.getStrategies();
const eoaStrategies = savingsAccount.strategiesManager
  .findAllStrategies({
    isEOA: true,
  })
  .map(strategy => ({
    strategyId: strategy.id,
    paramValuesByKey: {
      eoaAddress: eoaAccount.address,
    },
  }));
await savingsAccount.activateStrategies({ activeStrategies: eoaStrategies });
```

Each `DepositStrategy` (combination of Deposit Protocol + specific token on some chain) has unique id,
that is immutable. You can hardcode list of ids you whitelisted, or do some additional checks to
make sure you sign the correct permissions.

After this call auto-depositing is enabled, and API will start looking for an oportunity to auto-deposit.

#### Getting a list of activated strategies

You can retrieve list of activated strategies by calling the following code:

```ts
const activeStrategies = await savingsAccount.getCurrentActiveStrategies();
```

### Do manual Withdraw/Deposit

To withdraw funds that are currently deposited for an immediate use, do the following:

```ts
await savingsAccount.withdraw({
  amount: 123n, // in wei
  depositStrategyId: '<id of DepositStrategy to use>',
  pauseUntilDatetime: 'Date object to pause automatic depositing until',
});
```

You can also manually deposit it back:

```ts
await savingsAccount.deposit({
  amount: 123n, // in wei
  depositStrategyId: '<id of DepositStrategy to use>',
});
```

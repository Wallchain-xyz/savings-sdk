# Wallchain auto-yield SDK

## 1. Setup client

In order to automatically execute deposits/with we use AA concept, more specifically ZeroDev implementation.

### If you already have ZeroDev AA

You can seamlessly integrate savings functionality into existing account.

```ts
import SavingsSDK from '@wallchain/savings';

const savingsAccount = await SavingsSDK.makeSavingsAccount({
  projectId: process.env.WALLCHAIN_PROJECT_ID,
  baseUrl: process.env.WALLCHAIN_BASE_URL,
  privateKeyAccount,
  aaClient,
});
```

### If you don't have AA

In this case your users will be only able to have a separate saving account.

```ts
import SavingsSDK from '@wallchain/savings';

const aaClient = await SavingsSDK.setupAAClient({
  privateKeyAccount,
  bundlerRPC: process.env.WALLCHAIN_SAVINGS_BUNDLER_RPC,
  paymasterRPC: process.env.WALLCHAIN_SAVINGS_PAYMASTER_RPC,
});

// and the rest is the same
const savingsAccount = await SavingsSDK.makeSavingsAccount({
  zeroDevProjectId: process.env.WALLCHAIN_SAVINGS_PROJECT_ID,
  baseUrl: process.env.SAVINGS_API_BASE_URL,
  privateKeyAccount,
  aaClient,
});
```

## 2. Sign strategies

Strategies is the mechanism that allows to explicitly tell what tokens on what vaults can be deposited. We provide you all supported strategies in a JSON file. You can either let your user to select which ones to use or you can do it by yourself.

```ts
import { savingStrategies } from '@wallchain/savings';

const approvedStrategies = customApproveLogic(savingStrategies);
await savingsAccount.signStrategies(approvedStrategies);
```

By signing permissions you enable auto yield functionality. To stop yielding you need to revoke permissions:

```ts
await savingsAccount.revokeAllStrategies();
```

You can use data about tokens that are being approved for deposit in your UI:

```ts
const signedStrategies = await savingsAccount.getSignedStrategies();

const tokensWithEnabledDeposit = savingStrategies
  .filter(({ id }) => signedStrategies.includes(id))
  .map(({ token }) => token);
```

## 3. Manually deposit/withdrawal from vaults

You can also do these manipulations manually if you want:

```ts
const userOps = await savingsAccount.prepareWithdraw({
  tokenAddress,
  strategy, // if not passed will automatically select source of withdrawal
  amount,
});

const { hash } = await savingsAccount.sendUserOps(userOps);
```

```ts
const userOps = await savingsAccount.prepareDeposit({
  tokenAddress,
  strategy,
  amount,
});

const { hash } = await savingsAccount.sendUserOps(userOps);
```

## 4. Current deposits

Deposit protocols use their own tokens to represent and accrue value. You'd need to change the way you display balances for those tokens in UI to correctly display assets. Use this helper as a source of truth for those tokens:

```ts
const deposits = await savingsAccount.getDeposits();
/*
[
    {
        token: Address,
        mooToken: Address
        profit: Number, // in USD
        amount: BigInt, // current mooToken valuation in tokens
    }
]
*/
```

## 5. Transaction execution

You can execute operations directly on a savings account. This code will ensure that account has enough amount of specified token before operations, by (possibly) withdrawing crypto from staked state.

```ts
// we bypass zeroDev's sendUserOperation
const { hash } = await savingsAccount.sendUserOperation([
  ...savingsAccount.ensureTokenAvailable({
    address,
    amount,
  }),
  yourUserOperation, // your userOp...
  savingsAccount.wrapTxnToUserOp(txn), // ...or wrap regular txn
]);
```

In order to simulate a transaction containing multiple UserOps on an arbitrary simulation engine, we provide a tool that forms regular EVM transaction that can be simulated. Please note that the resulting bundled transaction is not signed, which is why it can be simulated, but not sent. The sending of user ops should be handled with Bundler RPC. This SDK provides the necessary methods.

```ts
const { data, value, from, to } = await savingsAccount.userOpsToTxn([
  ...savingsAccount.ensureTokenAvailable({
    address,
    amount,
  }),
  yourUserOperation,
]);
```

## 6. Transfer assets between accounts

To top up the savings account from the main one you'd need to execute a regular transfer:

```ts
const { data, value, to } = savingsAccount.prepareTopUpTxn({
  source,
  token,
  amount,
});
```

To transfer assets back it will be userOp flow instead:

```ts
// with helper
const { hash } = await savingsAccount.transfer({
  destination,
  token,
  amount,
});

// or you can form your own userOp
const transferOp = makeTransferUserOp(params);

const { hash } = await savingsAccount.sendUserOperation([
  ...savingsAccount.ensureTokenAvailable(tokenAddress, amount),
  transferOp,
]);
```

## 7. [Planned] Swap

```ts
...
import { getSwapPairs, prepareSwap } from "@wallchain/swap"

function usePrepareSwap({
    srcTokenAmount,
    dstTokenAmount,
    srcTokenAddress,
    dstTokenAddress
}) {
    const [ swapOps, setSwapOps ] = useState();
    const [ swapInfo, setSwapInfo ] = useState();
    const [ swapState, setSwapState ] = useState('pending');
    useEffect(() => {
        prepareSwap({
            srcTokenAmount,
            dstTokenAmount,
            srcTokenAddress,
            dstTokenAddress
        }).then(({ swapOps, swapInfo, swapState }) => {
            setSwapOps(swapOps);
            setSwapInfo(swapInfo);
            setSwapState(swapState);
        });
    }, [
        srcTokenAmount,
        dstTokenAmount,
        srcTokenAddress,
        dstTokenAddress
    ]);
    prepareSwap.then()
}

function SwapForm () {
    const { savingsAccount } = useSavingsAccount();
    const pairs = useSWR("wallchainSwapInfo", getSwapPairs);


    const { swapState, swapInfo, swapOps } = usePrepareSwap({
        srcTokenAmount,
        dstTokenAmount,
        srcTokenAddress,
        dstTokenAddress
    })
    ...
    const handleSwap = () => {
        const { hash } = await savingsAccount.sendUserOperation([
            ...savingsAccount.ensureTokenAvailable(tokenAddress, amount),
            ...swapOps
        ]);
    }
    ...
}
```

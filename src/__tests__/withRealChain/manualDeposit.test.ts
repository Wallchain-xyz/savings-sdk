import { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { DepositStrategy } from '../../depositStrategies/DepositStrategy';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

import { SavingsAccount } from '../../SavingsAccount/SavingsAccount';
import { HelperClient, createHelperRealClient } from '../../testSuite/createHelperRealClient';

const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL as string;

const wrappedDescribe = pimlicoApiKey && privateKey && savingsBackendUrl ? describe : describe.skip;

wrappedDescribe.each([
  ['beefy eth', '018ecbc3-597e-739c-bfac-80d534743e3e'],
  ['beefy usdc', '018f04e0-73d5-77be-baec-c76bac26b4f3'],
  ['beefy usdc eoa', '018f94ed-f3b8-7dd5-8615-5b07650f5772'],
  // ['moonwell usdc', '856a815e-dc16-41a0-84c8-1a94dd7f763b'],
  // ['moonwell usdc eoa', '2935fab9-23be-41d0-b58c-9fa46a12078f'],
])('Manual deposit for %s', (_: string, strategyId: string) => {
  let eoaAccount: PrivateKeyAccount;
  let client: HelperClient;
  let savingsAccount: SavingsAccount;

  beforeAll(() => {
    client = createHelperRealClient();
  });

  beforeEach(async () => {
    eoaAccount = privateKeyToAccount(privateKey);
    savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: client.chain.id,
      savingsBackendUrl,
      apiKey: pimlicoApiKey,
    });
  });

  async function getStrategyTokenBalance(strategy: DepositStrategy) {
    const ownerAddress = strategy.isEOA ? eoaAccount.address : savingsAccount.aaAddress;
    if (strategy.isNative) {
      return client.getBalance({ address: ownerAddress });
    }
    return client.getERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: ownerAddress,
    });
  }

  it('can deposit', async () => {
    // Arrange
    const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);

    // Act
    // Withdraw if already deposited
    await savingsAccount.singleStepWithdraw({ depositStrategyId: strategyId });
    const balanceBeforeDeposit = await getStrategyTokenBalance(strategy);
    if (strategy.isEOA) {
      await client.ensureAllowance({
        account: eoaAccount,
        tokenAddress: strategy.tokenAddress,
        spenderAddress: savingsAccount.aaAddress,
        amount: balanceBeforeDeposit,
        // Set big value to avoid needed txn for each test run
        amountToSet: balanceBeforeDeposit * 1_000_000n,
      });
    }
    await savingsAccount.deposit({
      depositStrategyId: strategyId,
      amount: balanceBeforeDeposit,
    });
    const balanceAfterDeposit = await getStrategyTokenBalance(strategy);
    // Withdraw for other tests to work
    await savingsAccount.singleStepWithdraw({
      depositStrategyId: strategyId,
    });

    // Assert
    expect(balanceBeforeDeposit).toBeGreaterThan(balanceAfterDeposit);
  }, 120_000);
});

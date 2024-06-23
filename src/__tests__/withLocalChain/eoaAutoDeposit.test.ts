import { PrivateKeyAccount } from 'viem';
import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { SavingsAccount } from '../../SavingsAccount/SavingsAccount';
import { createHelperTestClient } from '../../testSuite/createHelperTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

import {
  ALLOWED_DECREASE_DURING_DEPOSIT,
  LOCAL_BUNDLER_URL,
  LOCAL_CHAIN_RPC_URL,
  LOCAL_PAYMASTER_RPC_URL,
} from '../utils/consts';
import { createEoaAccount } from '../utils/createEoaAccount';
import { waitForSeconds } from '../utils/waitForSeconds';

const chain = base;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);

// TODO: @merlin add support for anvil on SKA
// eslint-disable-next-line jest/no-disabled-tests
describe.each([
  ['beefy usdc', '018f94ed-f3b8-7dd5-8615-5b07650f5772'],
  ['moonwell usdc', '2935fab9-23be-41d0-b58c-9fa46a12078f'],
])('Auto deposit for %s', (_: string, strategyId: string) => {
  let eoaAccount: PrivateKeyAccount;
  let savingsAccount: SavingsAccount;

  const testClient = createHelperTestClient();

  beforeAll(async () => {
    await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);
  }, 10_000);

  beforeEach(async () => {
    eoaAccount = createEoaAccount();
    await testClient.ensureEnoughBalanceForGas({ address: eoaAccount.address });
    savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl,
      rpcUrl: LOCAL_CHAIN_RPC_URL,
      bundlerUrl: LOCAL_BUNDLER_URL,
      paymasterUrl: LOCAL_PAYMASTER_RPC_URL,
    });
  });

  it('can deposit', async () => {
    // Arrange
    const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);
    const startBalance = await testClient.setERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: eoaAccount.address,
    });
    const depositAmount = startBalance / 2n;

    // Act
    await testClient.setAllowance({
      account: eoaAccount,
      tokenAddress: strategy.tokenAddress,
      spenderAddress: savingsAccount.aaAddress,
      amount: depositAmount,
    });
    await savingsAccount.auth();
    await savingsAccount.activateStrategies({
      activeStrategies: [
        {
          strategyId,
          paramValuesByKey: {
            eoaAddress: eoaAccount.address,
          },
        },
      ],
    });
    await savingsAccount.runDepositing();
    await waitForSeconds(5);

    // Assert
    const balanceAfterDepositing = await testClient.getERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: eoaAccount.address,
    });
    expect(balanceAfterDepositing).toBeLessThanOrEqual(startBalance - depositAmount);
    const bondAmount = await testClient.getERC20Balance({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
  }, 120_000);
});

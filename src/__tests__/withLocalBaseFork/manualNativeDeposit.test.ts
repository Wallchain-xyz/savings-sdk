import { PrivateKeyAccount, parseEther } from 'viem';

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

const chain = base; // TODO: maybe make it changeable

describe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;
  let savingsAccount: SavingsAccount;

  const testClient = createHelperTestClient();

  beforeAll(async () => {
    await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);
  }, 10_000);

  beforeEach(async () => {
    eoaAccount = createEoaAccount();
    savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      rpcUrl: LOCAL_CHAIN_RPC_URL,
      bundlerUrl: LOCAL_BUNDLER_URL,
      paymasterUrl: LOCAL_PAYMASTER_RPC_URL,
    });
  }, 10000);

  it('can deposit ETH on Base', async () => {
    // Arrange
    const startBalance = parseEther('42');
    const depositAmount = parseEther('1');
    await testClient.setBalance({
      address: savingsAccount.aaAddress,
      value: startBalance,
    });
    // Beefy ETH on Base strategy
    const strategy = savingsAccount.strategiesManager.getStrategy('018ecbc3-597e-739c-bfac-80d534743e3e');

    // Act
    const userOpResult = await savingsAccount.deposit({
      amount: depositAmount,
      depositStrategyId: strategy.id,
    });

    // Assert
    expect(userOpResult.success).toBeTruthy();
    const balanceAfter = await testClient.getBalance({ address: savingsAccount.aaAddress });
    expect(balanceAfter).toBeLessThanOrEqual(startBalance - depositAmount);
    const bondAmount = await testClient.getERC20Balance({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
  }, 120_000);
});

import { PrivateKeyAccount, parseEther } from 'viem';

import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { SavingsAccount } from '../../SavingsAccount/SavingsAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';
import { ChainHelper } from '../utils/ChainHelper';
import { LOCAL_BUNDLER_URL, LOCAL_CHAIN_RPC_URL, LOCAL_PAYMASTER_RPC_URL } from '../utils/consts';
import { createEoaAccount } from '../utils/createEoaAccount';
import { topUpUSDC } from '../utils/topUpUSDC';

const chain = base; // TODO: maybe make it changeable

describe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;
  let savingsAccount: SavingsAccount;
  let chainHelper: ChainHelper;

  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await ensurePaymasterIsReady();
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
    chainHelper = new ChainHelper({ chain, rpcURL: LOCAL_CHAIN_RPC_URL });
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
    const balanceAfter = await chainHelper.getNativeTokenAmount(savingsAccount.aaAddress);
    expect(balanceAfter).toBeLessThanOrEqual(startBalance - depositAmount);
    const bondAmount = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - 10n);
  }, 120_000);

  it('can deposit moonwell USDC on Base', async () => {
    // Arrange
    const startBalance = await topUpUSDC({
      address: savingsAccount.aaAddress,
      chainHelper,
      testClient,
    });
    const depositAmount = startBalance / 2n;
    // Moonwell USDC on Base strategy
    const strategy = savingsAccount.strategiesManager.getStrategy('856a815e-dc16-41a0-84c8-1a94dd7f763b');

    // Act
    const userOpResult = await savingsAccount.deposit({
      amount: depositAmount,
      depositStrategyId: strategy.id, // Moonwell USDC on Base strategy
    });

    // Assert
    expect(userOpResult.success).toBeTruthy();
    const balanceAfter = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.tokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    expect(balanceAfter).toBeLessThanOrEqual(startBalance - depositAmount);
    const bondAmount = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - 10n);
  }, 120_000);
});

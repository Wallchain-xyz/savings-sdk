import { Chain, PrivateKeyAccount, Transport, WalletClient, createWalletClient, parseEther } from 'viem';

import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { SavingsAccount } from '../../SavingsAccount/SavingsAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

import { ChainHelper } from '../utils/ChainHelper';
import { LOCAL_BUNDLER_URL, LOCAL_CHAIN_RPC_URL, LOCAL_PAYMASTER_RPC_URL } from '../utils/consts';

import { createEoaAccount } from '../utils/createEoaAccount';
import { setAllowance } from '../utils/ensureEoaAddressUsdcAllowance';
import { topUpUSDC } from '../utils/topUpUSDC';

const chain = base;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);

describe.each([
  ['beefy', '018f94ed-f3b8-7dd5-8615-5b07650f5772'],
  ['moonwell', '2935fab9-23be-41d0-b58c-9fa46a12078f'],
])('Provider %s Local Anvil', (_: string, strategyId: string) => {
  let eoaAccount: PrivateKeyAccount;
  let eoaClient: WalletClient<Transport, Chain, PrivateKeyAccount>;
  let chainHelper: ChainHelper;
  let savingsAccount: SavingsAccount;

  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);
    chainHelper = new ChainHelper({ chain, rpcURL: LOCAL_CHAIN_RPC_URL });
  }, 10_000);

  beforeEach(async () => {
    eoaAccount = createEoaAccount();
    eoaClient = createWalletClient({
      account: eoaAccount,
      chain: chainHelper.chain as Chain,
      transport: chainHelper.transport,
    });

    await testClient.setBalance({
      // Set balance for gas, amount is not important
      address: eoaAccount.address,
      value: parseEther('42'),
    });
    savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl,
      rpcUrl: LOCAL_CHAIN_RPC_URL,
      bundlerUrl: LOCAL_BUNDLER_URL,
      paymasterUrl: LOCAL_PAYMASTER_RPC_URL,
    });
  });

  it('can deposit USDC on Base', async () => {
    // Arrange
    const startBalance = await topUpUSDC({
      address: eoaAccount.address,
      chainHelper,
      testClient,
    });
    const depositAmount = startBalance / 2n;
    const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);

    // Act
    await setAllowance({
      walletClient: eoaClient,
      tokenAddress: strategy.tokenAddress,
      spenderAddress: savingsAccount.aaAddress,
      amount: depositAmount,
    });
    const userOpResult = await savingsAccount.deposit({
      amount: depositAmount,
      depositStrategyId: strategy.id,
    });

    // Assert
    expect(userOpResult.success).toBeTruthy();
    const balanceAfter = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.tokenAddress,
      accountAddress: eoaAccount.address,
    });
    await expect(balanceAfter).toBeLessThanOrEqual(startBalance - depositAmount);
    const bondAmount = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - 10n);
  }, 120_000);

  it('can withdraw USDC on Base', async () => {
    // Arrange
    const startBalance = await topUpUSDC({
      address: eoaAccount.address,
      chainHelper,
      testClient,
    });
    const depositAmount = startBalance / 2n;
    const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);
    await setAllowance({
      walletClient: eoaClient,
      tokenAddress: strategy.tokenAddress,
      spenderAddress: savingsAccount.aaAddress,
      amount: depositAmount,
    });
    await savingsAccount.deposit({
      amount: depositAmount,
      depositStrategyId: strategy.id,
    });

    // Act
    const userOpResult = await savingsAccount.withdraw({
      amount: await chainHelper.getERC20TokenAmount({
        tokenAddress: strategy.bondTokenAddress,
        accountAddress: savingsAccount.aaAddress,
      }),
      depositStrategyId: strategy.id,
    });

    // Assert
    expect(userOpResult.success).toBeTruthy();
    const balanceAfter = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.tokenAddress,
      accountAddress: eoaAccount.address,
    });
    expect(balanceAfter).toBeGreaterThanOrEqual(startBalance - 10n);
    const bondAmount = await chainHelper.getERC20TokenAmount({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    expect(bondAmount).toBeGreaterThanOrEqual(0n);
  }, 120_000);
});

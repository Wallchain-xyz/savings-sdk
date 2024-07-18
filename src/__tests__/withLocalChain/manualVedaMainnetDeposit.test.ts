import { PrivateKeyAccount, encodeFunctionData, parseAbi } from 'viem';

import { mainnet } from 'viem/chains';

import { MultiStepWithdrawStrategyId } from '../../depositStrategies/strategies';
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

const chain = mainnet;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);

// Requires mainnet local fork
// eslint-disable-next-line jest/no-disabled-tests
describe.skip.each([
  ['etherfi weth', 'c38d9a08-a0de-4866-bf16-e433a03848ff'],
  ['etherfi weth eoa', 'c1d136de-ee0c-4652-9708-836939241d3a'],
] as const)('Manual deposit for %s', (_: string, strategyId: MultiStepWithdrawStrategyId) => {
  let eoaAccount: PrivateKeyAccount;
  let savingsAccount: SavingsAccount;

  const testClient = createHelperTestClient(mainnet);

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
  }, 10_000);

  it('can deposit', async () => {
    // Arrange
    const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);
    const tokenOwnerAddress = strategy.isEOA ? eoaAccount.address : savingsAccount.aaAddress;
    const startBalance = await testClient.setERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: tokenOwnerAddress,
    });
    const depositAmount = startBalance / 2n;

    // Act
    if (strategy.isEOA) {
      await testClient.setAllowance({
        account: eoaAccount,
        tokenAddress: strategy.tokenAddress,
        spenderAddress: savingsAccount.aaAddress,
        amount: depositAmount,
      });
    }
    const userOpResult = await savingsAccount.deposit({
      amount: depositAmount,
      depositStrategyId: strategy.id,
    });

    // Assert
    expect(userOpResult.success).toBeTruthy();
    const balanceAfter = await testClient.getERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: tokenOwnerAddress,
    });
    expect(balanceAfter).toBeLessThanOrEqual(startBalance - depositAmount);
    const bondAmount = await testClient.getERC20Balance({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
  }, 120_000);

  it('can withdraw', async () => {
    // Arrange
    const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);
    const tokenOwnerAddress = strategy.isEOA ? eoaAccount.address : savingsAccount.aaAddress;
    const startBalance = await testClient.setERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: tokenOwnerAddress,
    });
    const depositAmount = startBalance / 2n;
    if (strategy.isEOA) {
      await testClient.setAllowance({
        account: eoaAccount,
        tokenAddress: strategy.tokenAddress,
        spenderAddress: savingsAccount.aaAddress,
        amount: depositAmount,
      });
    }
    await savingsAccount.deposit({
      amount: depositAmount,
      depositStrategyId: strategy.id,
    });

    // Act
    const userOpInitiateResult = await savingsAccount.initiateWithdraw({
      amount: await testClient.getERC20Balance({
        tokenAddress: strategy.bondTokenAddress,
        accountAddress: savingsAccount.aaAddress,
      }),
      depositStrategyId: strategy.id,
    });

    const transferERC20TxnHash = await testClient.sendUnsignedTransaction({
      from: '0x2322ba43eFF1542b6A7bAeD35e66099Ea0d12Bd1',
      to: '0x989468982b08AEfA46E37CD0086142A86fa466D7',
      data: encodeFunctionData({
        abi: parseAbi([
          'function redeemSolve(address queue, address offer, address want, address[] users, uint256 minimumAssetsOut, uint256 maxAssets, address teller)',
        ]),
        functionName: 'redeemSolve',
        args: [
          '0xD45884B592E316eB816199615A95C182F75dea07',
          '0x7223442cad8e9cA474fC40109ab981608F8c4273',
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          [savingsAccount.aaAddress],
          0n,
          100000000000000000000000000n,
          '0x929B44db23740E65dF3A81eA4aAB716af1b88474',
        ],
      }),
    });
    await testClient.waitForTransactionReceipt({ hash: transferERC20TxnHash });
    const userOpCompleteResult = await savingsAccount.completeWithdraw({
      depositStrategyId: strategy.id,
    });

    // Assert
    expect(userOpInitiateResult.success).toBeTruthy();
    expect(userOpCompleteResult.success).toBeTruthy();
    const balanceAfter = await testClient.getERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: tokenOwnerAddress,
    });
    const finalBalance = (startBalance * 9999n) / 10000n; // We pay 0.01% for gas
    expect(balanceAfter).toBeGreaterThanOrEqual(finalBalance - ALLOWED_DECREASE_DURING_DEPOSIT);
    const bondAmount = await testClient.getERC20Balance({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    expect(bondAmount).toBeGreaterThanOrEqual(0n);
  }, 120_000);
});

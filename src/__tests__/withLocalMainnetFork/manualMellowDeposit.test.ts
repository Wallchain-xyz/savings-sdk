import { Address, PrivateKeyAccount, encodeFunctionData, getContract, parseAbi } from 'viem';

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

const wStEthWithdrawalQueueAbi = parseAbi([
  'function getWithdrawalRequests(address _owner) view returns (uint256[] requestsIds)',
  'function prefinalize(uint256[] _batches, uint256 _maxShareRate) view returns (uint256 ethToLock, uint256 sharesToBurn)',
  'function finalize(uint256 _lastRequestIdToBeFinalized, uint256 _maxShareRate) payable',
]);

describe.each([
  ['mellow weth', '5155d89f-98c3-436b-bd87-d8fef022620a'],
  ['mellow weth eoa', 'a4be0324-c93c-4525-a0d1-48c6f9f1bb49'],
] as const)('Manual deposit for %s', (_: string, strategyId: MultiStepWithdrawStrategyId) => {
  let eoaAccount: PrivateKeyAccount;
  let savingsAccount: SavingsAccount;

  const testClient = createHelperTestClient(mainnet);

  async function forceMellowWithdraw() {
    const mellowForceWithdrawTxnHash = await testClient.sendUnsignedTransaction({
      from: '0xD5F5C6F71c662Ec60D49DBeFb0f8CC9Ae053b618',
      to: '0xE8206Fbf2D9F9E7fbf2F7b997E20a34f9158cC14',
      data: encodeFunctionData({
        abi: parseAbi(['function processAll()']),
        functionName: 'processAll',
        args: [],
      }),
    });
    await testClient.waitForTransactionReceipt({ hash: mellowForceWithdrawTxnHash });
  }

  async function forceLidoWithdraw() {
    const wStEthWithdawalQueueContract = getContract({
      address: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1' as Address,
      abi: wStEthWithdrawalQueueAbi,
      client: testClient,
    });
    const requests = await wStEthWithdawalQueueContract.read.getWithdrawalRequests([savingsAccount.aaAddress]);
    const [ethToLock, _] = await wStEthWithdawalQueueContract.read.prefinalize([requests, BigInt(10 ** 30)]);
    testClient.setBalance({
      address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84' as Address,
      value: 2n * ethToLock,
    });
    const lidoForceWithdrawTxnHash = await testClient.sendUnsignedTransaction({
      from: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      to: wStEthWithdawalQueueContract.address,
      value: ethToLock,
      data: encodeFunctionData({
        abi: wStEthWithdawalQueueContract.abi,
        functionName: 'finalize',
        args: [requests[0], BigInt(10 ** 30)],
      }),
    });
    await testClient.waitForTransactionReceipt({ hash: lidoForceWithdrawTxnHash });
  }

  beforeAll(async () => {
    await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);
    await testClient.ensureChainId({ chainId: mainnet.id });
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
    const pendingWithdrawalBeforeStep1 = await savingsAccount.getPendingWithdrawal(strategy.id);
    const withdrawAmount = await testClient.getERC20Balance({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    const userOpInitiateResult = await savingsAccount.startMultiStepWithdraw({
      depositStrategyId: strategy.id,
    });
    const pendingWithdrawalAfterStep1 = await savingsAccount.getPendingWithdrawal(strategy.id);
    await forceMellowWithdraw();

    const pendingWithdrawalBeforeStep2 = await savingsAccount.getPendingWithdrawal(strategy.id);
    const userOpStep1Result = await savingsAccount.continueMultiStepWithdraw({
      depositStrategyId: strategy.id,
    });
    const pendingWithdrawalAfterStep2 = await savingsAccount.getPendingWithdrawal(strategy.id);

    await forceLidoWithdraw();

    const pendingWithdrawalBeforeStep3 = await savingsAccount.getPendingWithdrawal(strategy.id);

    const userOpStep2Result = await savingsAccount.continueMultiStepWithdraw({
      depositStrategyId: strategy.id,
    });

    // Assert
    expect(userOpInitiateResult.success).toBeTruthy();
    expect(userOpStep1Result.success).toBeTruthy();
    expect(userOpStep2Result.success).toBeTruthy();

    expect(pendingWithdrawalBeforeStep1.currentStep).toBe(0);
    expect(pendingWithdrawalBeforeStep1.amount).toBe(0n);
    expect(pendingWithdrawalBeforeStep1.isStepCanBeExecuted).toBe(true);

    expect(pendingWithdrawalAfterStep1.currentStep).toBe(1);
    expect(pendingWithdrawalAfterStep1.amount).toBeGreaterThan(withdrawAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
    expect(pendingWithdrawalAfterStep1.isStepCanBeExecuted).toBe(false);

    expect(pendingWithdrawalBeforeStep2.currentStep).toBe(1);
    expect(pendingWithdrawalBeforeStep2.amount).toBeGreaterThan(withdrawAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
    expect(pendingWithdrawalBeforeStep2.isStepCanBeExecuted).toBe(true);

    expect(pendingWithdrawalAfterStep2.currentStep).toBe(2);
    expect(pendingWithdrawalAfterStep2.amount).toBeGreaterThan(withdrawAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
    expect(pendingWithdrawalAfterStep2.isStepCanBeExecuted).toBe(false);

    expect(pendingWithdrawalBeforeStep3.currentStep).toBe(2);
    expect(pendingWithdrawalBeforeStep3.amount).toBeGreaterThan(withdrawAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
    expect(pendingWithdrawalBeforeStep3.isStepCanBeExecuted).toBe(true);

    const balanceAfter = await testClient.getERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: tokenOwnerAddress,
    });
    const finalBalance = startBalance - depositAmount + (depositAmount * 999_998n) / 1000_000n;
    expect(balanceAfter).toBeGreaterThanOrEqual(finalBalance - ALLOWED_DECREASE_DURING_DEPOSIT);
    const bondAmount = await testClient.getERC20Balance({
      tokenAddress: strategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });
    expect(bondAmount).toBeGreaterThanOrEqual(0n);
  }, 120_000);
});

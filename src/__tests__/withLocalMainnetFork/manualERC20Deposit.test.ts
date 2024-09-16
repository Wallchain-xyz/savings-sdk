import { PrivateKeyAccount } from 'viem';

import { mainnet } from 'viem/chains';

import { StrategyId } from '../../depositStrategies/strategies';
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

describe.each([
  ['WBTC -> solvBTC eoa', '0191a35a-888c-7b58-b477-1eb687251cf8'],
  ['WBTC -> solvBTC aa', 'afa4733c-c297-4e89-9f44-bcc988445297'],
  ['SolvBTC -> solvBTC.BBN eoa', 'c0d17a3f-4c4f-443d-b3b4-3df5f3ab00d7'],
  ['SolvBTC -> solvBTC.BBN aa', '1f2649d5-7d53-4aed-8cb7-af0e47a6ec2c'],
  ['Fuel SolvBTC.BBN eoa', '3693460d-87fa-4c0a-afdc-67cf3ae63041'],
  ['Fuel SolvBTC.BBN aa', '1d349a1e-27ed-4c83-8201-a50cbf196c0d'],
  ['Mezo SolvBTC.BBN eoa', '00c0b60b-8ec6-4c2d-ad08-9457010121a8'],
  ['Mezo SolvBTC.BBN aa', '026d6585-492b-4f0a-92fa-5a472a7bcc52'],
  ['Etherfi WBTC -> eBTC aa', 'bf9f2459-32b5-4df1-a3b4-a7eed390f8d0'],
  ['Etherfi WBTC -> eBTC eoa', '650a8da2-de1c-49b6-b0d6-c71af4ab5447'],
  ['Mezo WBTC eoa', 'cd5bb544-c791-4f13-ad90-7a81e31dcf8d'],
  ['Mezo WBTC aa', 'c3a5781b-ac9d-4fcc-9ae2-6702fb2e3146'],
] as const)('Manual deposit for %s', (_: string, strategyId: StrategyId) => {
  let eoaAccount: PrivateKeyAccount;
  let savingsAccount: SavingsAccount;

  const testClient = createHelperTestClient(mainnet);

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
    expect(balanceAfter).toEqual(startBalance - depositAmount);
    const bondAmount = await strategy.getBondTokenBalance(savingsAccount.aaAddress);
    const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
    expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
    expect(depositEquivalent).toBeLessThanOrEqual(depositAmount + ALLOWED_DECREASE_DURING_DEPOSIT);
  }, 120_000);
});

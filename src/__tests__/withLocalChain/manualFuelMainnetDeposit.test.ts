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

// Requires mainnet local fork
// eslint-disable-next-line jest/no-disabled-tests
describe.each([['Fuel SolvBTC.BBN eoa', '3693460d-87fa-4c0a-afdc-67cf3ae63041']] as const)(
  'Manual deposit for %s',
  (_: string, strategyId: StrategyId) => {
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
      const bondAmount = await strategy.getBondTokenBalance(savingsAccount.aaAddress);
      const depositEquivalent = await strategy.bondTokenAmountToTokenAmount(bondAmount);
      expect(depositEquivalent).toBeGreaterThanOrEqual(depositAmount - ALLOWED_DECREASE_DURING_DEPOSIT);
    }, 120_000);
  },
);

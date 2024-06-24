import { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { DepositStrategy } from '../../depositStrategies/DepositStrategy';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

import { SavingsAccount } from '../../SavingsAccount/SavingsAccount';
import { HelperClient, createHelperRealClient } from '../../testSuite/createHelperRealClient';
import { ALLOWED_DECREASE_DURING_DEPOSIT, USDC_TOKEN_ADDRESS } from '../utils/consts';
import { waitForSeconds } from '../utils/waitForSeconds';

const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL as string;

const wrappedDescribe = pimlicoApiKey && privateKey && savingsBackendUrl ? describe : describe.skip;

wrappedDescribe('with proper setup', () => {
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

  async function getStrategyTokenBalance(strategy: Pick<DepositStrategy, 'isEOA' | 'tokenAddress' | 'isNative'>) {
    const ownerAddress = strategy.isEOA ? eoaAccount.address : savingsAccount.aaAddress;
    if (strategy.isNative) {
      return client.getBalance({ address: ownerAddress });
    }
    return client.getERC20Balance({
      tokenAddress: strategy.tokenAddress,
      accountAddress: ownerAddress,
    });
  }

  wrappedDescribe.each([
    ['beefy eth', '018ecbc3-597e-739c-bfac-80d534743e3e'],
    ['beefy usdc', '018f04e0-73d5-77be-baec-c76bac26b4f3'],
    ['beefy usdc eoa', '018f94ed-f3b8-7dd5-8615-5b07650f5772'],
    ['moonwell usdc', '856a815e-dc16-41a0-84c8-1a94dd7f763b'],
    ['moonwell usdc eoa', '2935fab9-23be-41d0-b58c-9fa46a12078f'],
  ])('Auto deposit for %s', (_: string, strategyId: string) => {
    it('can deposit', async () => {
      // Arrange
      const strategy = savingsAccount.strategiesManager.getStrategy(strategyId);

      // Act
      await savingsAccount.auth();
      // Withdraw if already deposited
      await savingsAccount.withdraw({
        depositStrategyId: strategyId,
      });
      const balanceBeforeDeposit = await getStrategyTokenBalance(strategy);
      // Activate if not already
      const activeStrategies = await savingsAccount.getCurrentActiveStrategies();
      if (!activeStrategies.some(activeStrategy => activeStrategy.id === strategyId)) {
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
      }
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

      await savingsAccount.runDepositing();
      await waitForSeconds(5);
      const balanceAfterDeposit = await getStrategyTokenBalance(strategy);
      // Withdraw for other tests to work
      await savingsAccount.withdraw({
        depositStrategyId: strategyId,
      });

      // Assert
      expect(balanceBeforeDeposit).toBeGreaterThan(balanceAfterDeposit);
    }, 120_000);
  });

  describe('with all strategies for USDC', () => {
    it('can deposit using all strategies for USDC', async () => {
      const tokenAddress = USDC_TOKEN_ADDRESS;

      await savingsAccount.auth();

      const initialWithdrawUserOpResult = await savingsAccount.withdrawAll();
      expect(initialWithdrawUserOpResult.success).toBeTruthy();

      const supportedEoaStrategies = savingsAccount.strategiesManager.findAllStrategies({ isEOA: true });
      const activeStrategies = await savingsAccount.getCurrentActiveStrategies();
      const activeEoaStrategies = activeStrategies.filter(activeStrategy => activeStrategy.isEOA);

      if (activeEoaStrategies.length !== supportedEoaStrategies.length) {
        await savingsAccount.activateStrategies({
          activeStrategies: supportedEoaStrategies.map(strategy => ({
            strategyId: strategy.id,
            paramValuesByKey: {
              eoaAddress: eoaAccount.address,
            },
          })),
        });
      }

      const balanceBeforeDeposit = await getStrategyTokenBalance({
        isEOA: true,
        isNative: false,
        tokenAddress,
      });

      await client.ensureAllowance({
        account: eoaAccount,
        tokenAddress,
        spenderAddress: savingsAccount.aaAddress,
        amount: balanceBeforeDeposit,
        // Set big value to avoid needed txn for each test run
        amountToSet: balanceBeforeDeposit * 1_000_000n,
      });

      await savingsAccount.runDepositing();
      await waitForSeconds(5);

      const balanceAfterDeposit = await getStrategyTokenBalance({
        isEOA: true,
        isNative: false,
        tokenAddress,
      });

      // Assert
      expect(balanceBeforeDeposit).toBeGreaterThan(balanceAfterDeposit);

      const finalWithdrawUserOpResult = await savingsAccount.withdrawAll();
      expect(finalWithdrawUserOpResult.success).toBeTruthy();

      const balanceAfterWithdraw = await getStrategyTokenBalance({
        isEOA: true,
        isNative: false,
        tokenAddress,
      });

      expect(balanceAfterWithdraw).toBeGreaterThan(balanceBeforeDeposit - ALLOWED_DECREASE_DURING_DEPOSIT);
    }, 45_000);
  });

  describe('withdrawAll', () => {
    it('does not fail when have no bond tokens', async () => {
      await savingsAccount.auth();
      const initialWithdrawUserOpResult = await savingsAccount.withdrawAll();
      expect(initialWithdrawUserOpResult.success).toBeTruthy();

      const secondWithdrawUserOpResult = await savingsAccount.withdrawAll();
      expect(secondWithdrawUserOpResult.success).toBeTruthy();
      // TODO: @merlin fix this test, so when nothing to withdraw txnHash is not send to chain
      // expect(secondWithdrawUserOpResult.txnHash).toBeUndefined();
    }, 15_000);
  });
});

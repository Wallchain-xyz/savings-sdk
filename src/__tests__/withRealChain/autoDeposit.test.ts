import { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { ActiveStrategyData } from '../../api/ska/__generated__/createApiClient';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

import { ChainHelper } from '../ChainHelper';
import { triggerDSToDeposit } from '../utils/triggerDSToDeposit';

const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const wrappedDescribe = pimlicoApiKey && privateKey ? describe : describe.skip;

wrappedDescribe('auto deposit', () => {
  let eoaAccount: PrivateKeyAccount;
  let chainHelper: ChainHelper;
  beforeAll(() => {
    chainHelper = new ChainHelper({ chain: base });
  });

  beforeEach(() => {
    eoaAccount = privateKeyToAccount(privateKey);
  });

  it('can deposit ETH on Base', async () => {
    const allStrategies = getSupportedDepositStrategies();
    const nativeStrategy = allStrategies.find(getIsNativeStrategy);
    if (!nativeStrategy) {
      throw new Error('No native strategy found');
    }

    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chainHelper.chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      apiKey: pimlicoApiKey,
    });

    await savingsAccount.auth();

    const bondTokenAmount = await chainHelper.getERC20TokenAmount({
      tokenAddress: nativeStrategy.bondTokenAddress,
      accountAddress: savingsAccount.aaAddress,
    });

    if (bondTokenAmount) {
      await savingsAccount.withdraw({
        depositStrategyId: nativeStrategy.id,
        amount: bondTokenAmount,
      });
    }

    const activeStrategies = await savingsAccount.getCurrentActiveStrategies();
    const activeNativeStrategy = activeStrategies.find(activeStrategy => activeStrategy.strategy.isNative);
    if (!activeNativeStrategy) {
      const activeStrategies: ActiveStrategyData[] = allStrategies.map(strategy => {
        return {
          strategyId: strategy.id,
          paramValuesByKey: {
            eoaAddress: eoaAccount.address,
          },
        };
      });

      await savingsAccount.activateStrategies(activeStrategies);
    }

    const nativeTokenAmount = await chainHelper.getNativeTokenAmount(savingsAccount.aaAddress);
    await triggerDSToDeposit();
    const nativeTokenAmountAfterDeposit = await chainHelper.getNativeTokenAmount(savingsAccount.aaAddress);

    expect(nativeTokenAmount).toBeGreaterThan(nativeTokenAmountAfterDeposit);
  }, 120_000);
});

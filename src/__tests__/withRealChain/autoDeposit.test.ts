import { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

import { ChainHelper } from '../utils/ChainHelper';
import { waitForSeconds } from '../utils/waitForSeconds';

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
    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chainHelper.chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      apiKey: pimlicoApiKey,
    });

    const nativeStrategy = savingsAccount.strategiesManager.findStrategy({ isNative: true });

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

    const activeNativeStrategies = await savingsAccount.getCurrentActiveStrategies({ isNative: true });
    if (activeNativeStrategies.length === 0) {
      await savingsAccount.activateStrategies({
        activeStrategies: [{ strategyId: nativeStrategy.id }],
      });
    }

    const nativeTokenAmount = await chainHelper.getNativeTokenAmount(savingsAccount.aaAddress);
    await savingsAccount.runDepositing();
    await waitForSeconds(5);
    const nativeTokenAmountAfterDeposit = await chainHelper.getNativeTokenAmount(savingsAccount.aaAddress);

    expect(nativeTokenAmount).toBeGreaterThan(nativeTokenAmountAfterDeposit);
  }, 120_000);
});

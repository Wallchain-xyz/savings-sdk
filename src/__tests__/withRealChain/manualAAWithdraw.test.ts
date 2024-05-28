import { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const usdcAmountToDeposit = BigInt(process.env.USDC_AMOUNT ?? '') as bigint;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL as string;
const wrappedDescribe =
  pimlicoApiKey && privateKey && usdcAmountToDeposit && savingsBackendUrl ? describe : describe.skip;

const createSavingsAccount = (account: PrivateKeyAccount) => {
  return createSavingsAccountFromPrivateKeyAccount({
    privateKeyAccount: account,
    chainId: base.id, // TODO: maybe make it changeable
    savingsBackendUrl,
    apiKey: pimlicoApiKey,
  });
};

wrappedDescribe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;

  beforeEach(() => {
    eoaAccount = privateKeyToAccount(privateKey);
  });

  it('AA can withdraw USDC on Base', async () => {
    const savingsAccount = await createSavingsAccount(eoaAccount);

    await savingsAccount.auth();

    const response = await savingsAccount.withdraw({
      amount: usdcAmountToDeposit,
      depositStrategyId: '018f04e0-73d5-77be-baec-c76bac26b4f3', // Beefy AA USDC on Base strategy
    });
    expect(response.success).toBe(true);
  }, 120_000);
});

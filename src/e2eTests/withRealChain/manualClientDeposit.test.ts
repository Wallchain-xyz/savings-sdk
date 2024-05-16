import { Hex, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { getSupportedDepositStrategies } from '../../depositStrategies';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

const createSavingsAccount = (account: PrivateKeyAccount) => {
  if (!process.env.PIMLICO_API_KEY) {
    throw new Error('No process.env.PIMLICO_API_KEY');
  }
  return createSavingsAccountFromPrivateKeyAccount({
    privateKeyAccount: account,
    chainId: base.id, // TODO: maybe make it changeable
    savingsBackendUrl: 'http://localhost:8000',
    apiKey: process.env.PIMLICO_API_KEY,
  });
};
describe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;

  beforeEach(() => {
    if (!process.env.PRIVATE_KEY) {
      throw new Error('Please provide process.env.PRIVATE_KEY, which has AA account with some amount of ETH on base');
    }
    eoaAccount = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);
  });

  it('can deposit ETH on Base', async () => {
    const savingsAccount = await createSavingsAccount(eoaAccount);

    await savingsAccount.auth();
    const allStrategies = getSupportedDepositStrategies();
    // DO if needed, requires additional gas
    // const strategiesIds = allStrategies.map(it => it.id);
    // await savingsAccount.activateStrategies(strategiesIds);

    const activeStrategies = await savingsAccount.getActiveStrategies();
    expect(activeStrategies).toStrictEqual(allStrategies);

    const hash = await savingsAccount.deposit({
      amount: BigInt(1),
      depositStrategyId: '018ecbc3-597e-739c-bfac-80d534743e3e',
    });
    expect(hash).toBeTruthy();
  }, 2000_000);
});

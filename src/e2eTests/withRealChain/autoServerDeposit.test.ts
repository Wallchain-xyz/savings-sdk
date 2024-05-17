import axios from 'axios';
import { Address, Hex, PrivateKeyAccount, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { getSupportedDepositStrategies } from '../../depositStrategies';
import { getIsNativeStrategy } from '../../depositStrategies/getIsNativeStrategy';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const wrappedDescribe = pimlicoApiKey && privateKey ? describe : describe.skip;

const chain = base; // TODO: maybe make it changeable
const publicClient = createPublicClient({
  chain,
  transport: http(),
});

function getBondTokenAmount(bondTokenAddress: Address, aaAddress: Address) {
  return publicClient.readContract({
    address: bondTokenAddress,
    abi: [
      {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [aaAddress],
  });
}

wrappedDescribe('auto deposit', () => {
  let eoaAccount: PrivateKeyAccount;

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
      chainId: chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      apiKey: pimlicoApiKey,
    });

    await savingsAccount.auth();

    const bondTokenAmount = await getBondTokenAmount(nativeStrategy.bondTokenAddress, savingsAccount.aaAddress);

    if (bondTokenAmount) {
      await savingsAccount.withdraw({
        depositStrategyId: nativeStrategy.id,
        amount: bondTokenAmount,
      });
    }

    const activeStrategies = await savingsAccount.getActiveStrategies();
    const activeNativeStrategy = activeStrategies.find(getIsNativeStrategy);
    if (!activeNativeStrategy) {
      const strategiesIds = allStrategies.map(it => it.id);

      await savingsAccount.activateStrategies(strategiesIds);
    }

    const nativeTokenAmount = await publicClient.getBalance({
      address: savingsAccount.aaAddress,
    });
    //

    await axios.post('http://localhost:8000/yield/deposits/8453/auto_deposit_poller').catch(error => {
      // eslint-disable-next-line no-console
      console.log(error);
      throw new Error('Auto deposit trigger failed!');
    });

    // wait for the system to finish depositing
    await new Promise(resolve => {
      setTimeout(resolve, 15_000);
    });
    const nativeTokenAmountAfterDeposit = await publicClient.getBalance({
      address: savingsAccount.aaAddress,
    });

    expect(nativeTokenAmount).toBeGreaterThan(nativeTokenAmountAfterDeposit);
  }, 2000_000);
});

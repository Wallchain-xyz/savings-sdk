import { Address, encodeFunctionData, parseAbi, parseEther } from 'viem';

import { ExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ChainHelper } from '../ChainHelper';

import { USDC_SOURCE_ACCOUNT_ADDRESS, USDC_TOKEN_ADDRESS } from './consts';

interface Params {
  eoaAddress: Address;
  chainHelper: ChainHelper;
  testClient: ExtendedTestClient;
}

export async function topUpEoaWithUsdcAmountToDeposit({ eoaAddress, chainHelper, testClient }: Params) {
  const usdcSourceAddressTokenAmount = await chainHelper.getERC20TokenAmount({
    tokenAddress: USDC_TOKEN_ADDRESS,
    accountAddress: USDC_SOURCE_ACCOUNT_ADDRESS,
  });
  const amountToDeposit = usdcSourceAddressTokenAmount / 1000n;

  await testClient.impersonateAccount({
    address: USDC_SOURCE_ACCOUNT_ADDRESS,
  });

  testClient.setBalance({
    address: USDC_SOURCE_ACCOUNT_ADDRESS,
    value: parseEther('42'),
  });

  const topUpEoaUsdcHash = await testClient.sendUnsignedTransaction({
    from: USDC_SOURCE_ACCOUNT_ADDRESS,
    to: USDC_TOKEN_ADDRESS,
    data: encodeFunctionData({
      abi: parseAbi(['function transfer(address to, uint256 value) view returns (uint256)']),
      functionName: 'transfer',
      args: [eoaAddress, amountToDeposit],
    }),
  });

  const topUpEoaUsdcHashReceipt = await chainHelper.waitForTransactionReceipt(topUpEoaUsdcHash);
  if (topUpEoaUsdcHashReceipt.status !== 'success') {
    throw new Error('Can not take USDC');
  }
  const eoaUsdcAmount = await chainHelper.getERC20TokenAmount({
    tokenAddress: USDC_TOKEN_ADDRESS,
    accountAddress: eoaAddress,
  });

  expect(eoaUsdcAmount).toBe(amountToDeposit);

  return amountToDeposit;
}

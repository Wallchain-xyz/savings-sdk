import { Address, encodeFunctionData, parseAbi, parseEther } from 'viem';

import { ExtendedTestClient } from '../../testSuite/createExtendedTestClient';

import { ChainHelper } from './ChainHelper';

import { USDC_SOURCE_ACCOUNT_ADDRESS, USDC_TOKEN_ADDRESS } from './consts';

interface Params {
  address: Address;
  chainHelper: ChainHelper;
  testClient: ExtendedTestClient;
  amount?: bigint;
}

export async function topUpUSDC({ address, chainHelper, testClient, amount }: Params) {
  let topUpAmount;
  if (!amount) {
    const usdcSourceAddressTokenAmount = await chainHelper.getERC20TokenAmount({
      tokenAddress: USDC_TOKEN_ADDRESS,
      accountAddress: USDC_SOURCE_ACCOUNT_ADDRESS,
    });
    topUpAmount = usdcSourceAddressTokenAmount / 1_000_000n;
  } else {
    topUpAmount = amount;
  }

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
      args: [address, topUpAmount],
    }),
  });

  const topUpUSDCReceipt = await chainHelper.waitForTransactionReceipt(topUpEoaUsdcHash);
  if (topUpUSDCReceipt.status !== 'success') {
    throw new Error('Failed to top up USDC');
  }
  const targetUSDCBalance = await chainHelper.getERC20TokenAmount({
    tokenAddress: USDC_TOKEN_ADDRESS,
    accountAddress: address,
  });

  expect(targetUSDCBalance).toBeGreaterThanOrEqual(topUpAmount);

  return topUpAmount;
}

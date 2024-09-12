import { ADDRESS_ZERO } from '@biconomy/account';
import { Address, encodeFunctionData, parseAbi } from 'viem';

import {
  EBTC_ADDRESS,
  EBTC_SOURCE_ACCOUNT_ADDRESS,
  SOLV_BTC_ADDRESS,
  SOLV_BTC_BBN_ADDRESS,
  SOLV_BTC_BBN_SOURCE_ACCOUNT_ADDRESS,
  SOLV_BTC_SOURCE_ACCOUNT_ADDRESS,
  USDC_SOURCE_ACCOUNT_ADDRESS,
  USDC_TOKEN_ADDRESS,
  WBTC_ADDRESS,
  WBTC_SOURCE_ACCOUNT_ADDRESS,
  WETH_SOURCE_ACCOUNT_ADDRESS,
  WETH_TOKEN_ADDRESS,
} from '../../__tests__/utils/consts';
import { ExtendedTestClient } from '../createExtendedTestClient';

import { ensureEnoughBalanceForGas } from './ensureEnoughBalanceForGas';
import { getERC20Balance } from './getERC20Balance';

export interface SetERC20BalanceParams {
  tokenAddress: Address;
  accountAddress: Address;
  amount?: bigint;
}

const DONOR_ADDRESS_BY_TOKEN: { [key: Address]: Address | undefined } = {
  [USDC_TOKEN_ADDRESS]: USDC_SOURCE_ACCOUNT_ADDRESS,
  [WETH_TOKEN_ADDRESS]: WETH_SOURCE_ACCOUNT_ADDRESS,
  [WBTC_ADDRESS]: WBTC_SOURCE_ACCOUNT_ADDRESS,
  [SOLV_BTC_ADDRESS]: SOLV_BTC_SOURCE_ACCOUNT_ADDRESS,
  [SOLV_BTC_BBN_ADDRESS]: SOLV_BTC_BBN_SOURCE_ACCOUNT_ADDRESS,
  [EBTC_ADDRESS]: EBTC_SOURCE_ACCOUNT_ADDRESS,
};

export async function setERC20Balance(
  client: ExtendedTestClient,
  { tokenAddress, accountAddress, amount }: SetERC20BalanceParams,
) {
  const currentBalance = await getERC20Balance(client, { tokenAddress, accountAddress });
  if (amount && currentBalance > amount) {
    // Current balance is bigger -> let's send tokens to zero address
    const transferERC20TxnHash = await client.sendUnsignedTransaction({
      from: accountAddress,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: parseAbi(['function transfer(address to, uint256 value) view returns (uint256)']),
        functionName: 'transfer',
        args: [ADDRESS_ZERO, currentBalance - amount],
      }),
    });
    await client.waitForTransactionReceipt({ hash: transferERC20TxnHash });
  } else {
    // Current balance is smaller -> let's send tokens from donor
    const donorAddress = DONOR_ADDRESS_BY_TOKEN[tokenAddress];
    if (!donorAddress) {
      throw new Error(`Cannot set balance for token ${tokenAddress} - donor address is not set`);
    }
    const donorBalance = await getERC20Balance(client, { tokenAddress, accountAddress: donorAddress });
    if (amount && donorBalance < amount) {
      throw new Error(`Cannot set balance for token ${tokenAddress} to ${amount} - donor doesn't have anough balance`);
    }
    if (!amount) {
      // eslint-disable-next-line no-param-reassign
      amount = donorBalance / 1_000_000n;
    }
    await ensureEnoughBalanceForGas(client, { address: donorAddress });
    const transferERC20TxnHash = await client.sendUnsignedTransaction({
      from: donorAddress,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: parseAbi(['function transfer(address to, uint256 value) view returns (uint256)']),
        functionName: 'transfer',
        args: [accountAddress, amount],
      }),
    });
    await client.waitForTransactionReceipt({ hash: transferERC20TxnHash });
  }
  // Verify result
  const updatedBalance = await getERC20Balance(client, { tokenAddress, accountAddress });
  if (updatedBalance !== amount) {
    throw new Error(`Failed set token ${tokenAddress} to ${amount}`);
  }
  return updatedBalance;
}

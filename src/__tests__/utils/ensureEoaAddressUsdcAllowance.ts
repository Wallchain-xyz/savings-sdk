import { Account, Address, Chain, createWalletClient, publicActions } from 'viem';

import { createAllowanceTxn } from '../../AAManager/txns/createAllowanceTxn';
import { ChainHelper } from '../ChainHelper';

import { USDC_TOKEN_ADDRESS } from './consts';

interface EnsureEoaAddressUsdcAllowanceParams {
  chainHelper: ChainHelper;
  savingsAccountAddress: Address;
  amountToDeposit: bigint;
  eoaAccount: Account;
}

export async function ensureEoaAddressUsdcAllowance({
  chainHelper,
  savingsAccountAddress,
  amountToDeposit,
  eoaAccount,
}: EnsureEoaAddressUsdcAllowanceParams) {
  const eoaAddress = eoaAccount.address;

  const allowance = await chainHelper.getERC20TokenAllowance({
    tokenAddress: USDC_TOKEN_ADDRESS,
    tokenSpenderAddress: savingsAccountAddress,
    tokenOwnerAddress: eoaAddress,
  });

  if (allowance < amountToDeposit) {
    const allowanceTxn = createAllowanceTxn({
      owner: eoaAddress,
      token: USDC_TOKEN_ADDRESS,
      amount: amountToDeposit,
      spender: savingsAccountAddress,
    });

    const walletClient = createWalletClient({
      account: eoaAccount,
      chain: chainHelper.chain as Chain,
      transport: chainHelper.transport,
    }).extend(publicActions);
    const txnHash = await walletClient.sendTransaction(allowanceTxn);
    const response = await chainHelper.waitForTransactionReceipt(txnHash);
    if (response.status !== 'success') {
      throw new Error('Can not give allowance');
    }
  }
}

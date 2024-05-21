import { Account, Address, createWalletClient, http, parseEther, publicActions } from 'viem';

import { createAllowanceTxn } from '../../AAManager/txns/createAllowanceTxn';
import { ExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ChainHelper } from '../ChainHelper';

import { LOCAL_CHAIN_RPC_URL, USDC_TOKEN_ADDRESS } from './consts';

interface EnsureEoaAddressUsdcAllowanceParams {
  chainHelper: ChainHelper;
  testClient: ExtendedTestClient;
  savingsAccountAddress: Address;
  amountToDeposit: bigint;
  eoaAccount: Account;
}

export async function ensureEoaAddressUsdcAllowance({
  chainHelper,
  testClient,
  savingsAccountAddress,
  amountToDeposit,
  eoaAccount,
}: EnsureEoaAddressUsdcAllowanceParams) {
  const eoaAddress = eoaAccount.address;
  testClient.setBalance({
    address: eoaAddress,
    value: parseEther('42'),
  });
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
      chain: chainHelper.chain,
      transport: http(LOCAL_CHAIN_RPC_URL),
    }).extend(publicActions);
    const txnHash = await walletClient.sendTransaction(allowanceTxn);
    const response = await chainHelper.waitForTransactionReceipt(txnHash);
    if (response.status !== 'success') {
      throw new Error('Can not give allowance');
    }
  }
}

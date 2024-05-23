import { Account, Address, Chain, createWalletClient, encodeFunctionData, parseAbi, publicActions } from 'viem';

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
    const allowanceTxn = {
      to: USDC_TOKEN_ADDRESS,
      value: 0n,
      data: encodeFunctionData({
        abi: parseAbi(['function approve(address spender, uint256 amount) external returns (bool)']),
        functionName: 'approve',
        args: [savingsAccountAddress, amountToDeposit],
      }),
    };

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

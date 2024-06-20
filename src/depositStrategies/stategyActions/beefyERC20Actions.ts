import { encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  BeefyDepositStrategyConfig,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

const erc20VaultABI = parseAbi(['function deposit(uint _amount) public', 'function withdraw(uint256 _shares) public']);

export function beefyERC20Actions(
  strategy: DepositStrategyWithActions<BeefyDepositStrategyConfig>,
): DepositWithdrawActions {
  return {
    createDepositTxns: ({ amount }: CreateDepositTxnsParams) => [
      {
        to: strategy.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [strategy.bondTokenAddress, amount],
        }),
      },
      {
        to: strategy.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20VaultABI,
          functionName: 'deposit',
          args: [amount],
        }),
      },
    ],

    createWithdrawTxns: async ({ amount }: CreateWithdrawTxnsParams) => [
      {
        to: strategy.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20VaultABI,
          functionName: 'withdraw',
          args: [amount],
        }),
      },
    ],
  };
}
import { encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  BeefyDepositStrategyConfig,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

const erc20VaultABI = parseAbi([
  'function deposit(uint _amount) public',
  'function withdraw(uint256 _shares) public',
  // TODO: @merlin migrate from withdraw to withdrawAll
  // 'function withdrawAll() public',
]);

export function beefyERC20DepositWithdrawActions(
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

    createWithdrawTxns: async ({ amount }: CreateWithdrawTxnsParams) => {
      // TODO: @merlin think how to remove this duplication
      // if (amount === undefined) {
      //   return [
      //     {
      //       to: strategy.bondTokenAddress,
      //       value: 0n,
      //       data: encodeFunctionData({
      //         abi: erc20VaultABI,
      //         functionName: 'withdrawAll',
      //       }),
      //     },
      //   ];
      // }
      return [
        {
          to: strategy.bondTokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20VaultABI,
            functionName: 'withdraw',
            args: [amount],
          }),
        },
      ];
    },
  };
}

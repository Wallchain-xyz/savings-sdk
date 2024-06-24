import { encodeFunctionData, parseAbi } from 'viem';

import {
  BeefyDepositStrategyConfig,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

const nativeVaultABI = parseAbi([
  'function depositBNB() public payable',
  'function withdrawBNB(uint256 _shares) public',
  'function balanceOf(address owner) view returns (uint256)',
  // TODO: @merlin migrate from withdrawBNB to withdrawAllBNB
  // 'function withdrawAllBNB() public nonpayable',
]);

export function beefyNativeActions(
  strategy: DepositStrategyWithActions<BeefyDepositStrategyConfig>,
): DepositWithdrawActions {
  return {
    createDepositTxns: ({ amount }: CreateDepositTxnsParams) => [
      {
        to: strategy.bondTokenAddress,
        value: amount,
        data: encodeFunctionData({
          abi: nativeVaultABI,
          functionName: 'depositBNB',
          args: [],
        }),
      },
    ],

    createWithdrawTxns: async ({ amount }: CreateWithdrawTxnsParams) => {
      // TODO: @merlin think how to remove this duplication
      if (amount === 0n) {
        return [];
      }
      // if (amount === undefined) {
      //   return [
      //     {
      //       to: strategy.bondTokenAddress,
      //       value: 0n,
      //       data: encodeFunctionData({
      //         abi: vaultAbi,
      //         functionName: 'withdrawAllBNB',
      //       }),
      //     },
      //   ];
      // }

      return [
        {
          to: strategy.bondTokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: nativeVaultABI,
            functionName: 'withdrawBNB',
            args: [amount],
          }),
        },
      ];
    },
  };
}

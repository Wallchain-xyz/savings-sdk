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

    createWithdrawTxns: async ({ amount }: CreateWithdrawTxnsParams) => [
      {
        to: strategy.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: nativeVaultABI,
          functionName: 'withdrawBNB',
          args: [amount],
        }),
      },
    ],
  };
}

import { Address, encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  AaveV3DepositStrategyConfig,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

const aaveV3Abi = parseAbi([
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) public',
  'function withdraw(address asset, uint256 amount, address to) public',
]);

export function aaveV3ERC20Actions(
  strategy: DepositStrategyWithActions<AaveV3DepositStrategyConfig>,
): DepositWithdrawActions {
  return {
    createDepositTxns: ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => [
      {
        to: strategy.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [strategy.config.poolAddress, amount],
        }),
      },
      {
        to: strategy.config.poolAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: aaveV3Abi,
          functionName: 'supply',
          args: [strategy.tokenAddress, amount, paramValuesByKey.aaAddress as Address, 0],
        }),
      },
    ],

    createWithdrawTxns: async ({ amount, paramValuesByKey }: CreateWithdrawTxnsParams) => [
      {
        to: strategy.config.poolAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: aaveV3Abi,
          functionName: 'withdraw',
          args: [strategy.tokenAddress, amount, paramValuesByKey.aaAddress as Address],
        }),
      },
    ],
  };
}

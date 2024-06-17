import { encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

const moonwellAbi = parseAbi([
  'function mint(uint256 mintAmount) public',
  'function redeem(uint256 redeemTokens) public',
  'function exchangeRateStored() public view returns (uint)',
]);

export function moonwellERC20Actions(strategy: DepositStrategyWithActions): DepositWithdrawActions {
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
          abi: moonwellAbi,
          functionName: 'mint',
          args: [amount],
        }),
      },
    ],

    createWithdrawTxns: async ({ amount }: CreateWithdrawTxnsParams) => [
      {
        to: strategy.bondTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: moonwellAbi,
          functionName: 'redeem',
          args: [amount],
        }),
      },
    ],
  };
}

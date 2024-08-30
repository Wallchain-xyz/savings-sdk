import { encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositSingleStepWithdrawActions,
  DepositStrategyWithActions,
  MezoDepositStrategyConfig,
} from '../DepositStrategy';

// Contract source code: https://vscode.blockscan.com/ethereum/0xd7097af27b14e204564c057c636022fae346fe60

export function mezoERC20Actions(
  strategy: DepositStrategyWithActions<MezoDepositStrategyConfig>,
): DepositSingleStepWithdrawActions<MezoDepositStrategyConfig> {
  return {
    createDepositTxns: async ({ amount }: CreateDepositTxnsParams) => [
      {
        to: strategy.config.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [strategy.config.vaultAddress, amount],
        }),
      },
      {
        to: strategy.config.vaultAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: parseAbi(['function deposit(address token,uint96 amount,uint32 lockPeriod)']),
          functionName: 'deposit',
          args: [
            strategy.config.tokenAddress,
            amount,
            60 * 60 * 24 * 7 * 8, // this is 8 weeks, min lock period
          ],
        }),
      },
    ],
    createWithdrawTxns: async (_: CreateWithdrawTxnsParams) => {
      // eslint-disable-next-line no-console
      console.error('CreateWithdrawTxns is under active development');
      return [];
    },
  };
}

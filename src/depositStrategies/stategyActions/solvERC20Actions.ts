import { Address, encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositMultiStepWithdrawActions,
  DepositStrategyWithActions,
  SolvDepositStrategyConfig,
} from '../DepositStrategy';

// Contract source code: https://vscode.blockscan.com/ethereum/0xd7097af27b14e204564c057c636022fae346fe60

export function solvERC20Actions(
  strategy: DepositStrategyWithActions<SolvDepositStrategyConfig>,
): DepositMultiStepWithdrawActions<SolvDepositStrategyConfig> {
  return {
    createDepositTxns: async ({ amount }: CreateDepositTxnsParams) => [
      {
        to: strategy.config.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'approve',
          args: [strategy.config.routerAddress, amount],
        }),
      },
      {
        to: strategy.config.routerAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: parseAbi(['function createSubscription(bytes32 poolId_, uint256 currencyAmount_)']),
          functionName: 'createSubscription',
          args: [strategy.config.poolId, amount],
        }),
      },
    ],
    withdrawStepsCount: 2,
    getPendingWithdrawal: async (_: Address) => {
      // eslint-disable-next-line no-console
      console.error('CreateWithdrawTxns is under active development');
      return { currentStep: 0, isStepCanBeExecuted: false, amount: 0n };
    },
    createWithdrawStepTxns: async (_: number, __: CreateWithdrawTxnsParams) => {
      // eslint-disable-next-line no-console
      console.error('CreateWithdrawTxns is under active development');
      return [];
    },
  };
}

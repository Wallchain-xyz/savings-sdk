import { encodeFunctionData, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositSingleStepWithdrawActions,
  DepositStrategyWithActions,
  FuelDepositStrategyConfig,
} from '../DepositStrategy';

// Contract source code: https://vscode.blockscan.com/ethereum/0x36fa1d4f525850794463d9bb47fc5a48295a9e45

export function fuelERC20Actions(
  strategy: DepositStrategyWithActions<FuelDepositStrategyConfig>,
): DepositSingleStepWithdrawActions<FuelDepositStrategyConfig> {
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
          abi: parseAbi(['function deposit(address token,uint240 amount,uint16 depositParam)']),
          functionName: 'deposit',
          args: [strategy.config.tokenAddress, amount, 0],
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

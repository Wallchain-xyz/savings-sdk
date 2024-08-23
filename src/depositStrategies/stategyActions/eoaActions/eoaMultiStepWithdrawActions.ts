import { encodeFunctionData } from 'viem';

import { erc20ABI } from '../../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateWithdrawTxnsParams,
  DepositStrategyConfig,
  DepositStrategyWithActions,
  MultiStepWithdrawActions,
} from '../../DepositStrategy';

import { ensureAddress } from './ensureAddress';

export function eoaMultiStepWithdrawActions<
  config extends { isSingleStepWithdraw: false } & DepositStrategyConfig,
  Actions extends MultiStepWithdrawActions<config> & BondTokenActions,
>(
  strategy: DepositStrategyWithActions<config, Actions>,
): MultiStepWithdrawActions<{ isSingleStepWithdraw: false } & config> {
  return {
    withdrawStepsCount: strategy.withdrawStepsCount,
    getPendingWithdrawal: strategy.getPendingWithdrawal,
    createWithdrawStepTxns: async (step: number, params: CreateWithdrawTxnsParams) => {
      const strategySpecificTxns = await strategy.createWithdrawStepTxns(step, params);
      if (step !== strategy.withdrawStepsCount - 1) {
        return strategySpecificTxns;
      }
      const { amount, paramValuesByKey } = params;
      const tokenAmountPromise = strategy.bondTokenAmountToTokenAmount(amount);
      return [
        ...strategySpecificTxns,
        {
          to: strategy.tokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20ABI,
            functionName: 'transfer',
            args: [ensureAddress(paramValuesByKey, 'eoaAddress'), await tokenAmountPromise],
          }),
        },
      ];
    },
  };
}

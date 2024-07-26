import { PublicClient, encodeFunctionData, getContract } from 'viem';

import { erc20ABI } from '../../../utils/erc20ABI';
import {
  BondTokenActions,
  DepositStrategyConfig,
  DepositStrategyWithActions,
  MultiStepWithdrawActions,
} from '../../DepositStrategy';

import { ensureAddress } from './ensureAddress';

export function eoaMultiStepWithdrawActions(
  publicClient: PublicClient,
): <
  config extends { isSingleStepWithdraw: false } & DepositStrategyConfig,
  Actions extends MultiStepWithdrawActions<config> & BondTokenActions,
>(
  strategy: DepositStrategyWithActions<config, Actions>,
) => MultiStepWithdrawActions<{ isSingleStepWithdraw: false } & config> {
  return strategy => {
    const tokenContract = getContract({
      address: strategy.tokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });
    return {
      withdrawStepsCount: strategy.withdrawStepsCount,
      getPendingWithdrawal: async aaAddress => {
        const aaPendingWithdrawal = await strategy.getPendingWithdrawal(aaAddress);
        if (aaPendingWithdrawal.currentStep !== 0) {
          return aaPendingWithdrawal;
        }
        // Some protocols (veda) completes withdrawal automatically,
        // so we should check balance of token
        const balance = await tokenContract.read.balanceOf([aaAddress]);
        if (balance === 0n) {
          return aaPendingWithdrawal;
        }
        return {
          amount: await strategy.tokenAmountToBondTokenAmount(balance),
          currentStep: strategy.withdrawStepsCount - 1,
          isStepCanBeExecuted: true,
          isFinalStep: true,
        };
      },
      createWithdrawStepTxns: async (step, params) => {
        const strategySpecificTxns = await strategy.createWithdrawStepTxns(step, params);
        if (step !== strategy.withdrawStepsCount - 1) {
          // Append transfer to last step
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
  };
}

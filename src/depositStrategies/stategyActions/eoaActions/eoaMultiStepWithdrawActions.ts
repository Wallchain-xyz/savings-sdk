import { PublicClient, encodeFunctionData, getContract } from 'viem';

import { erc20ABI } from '../../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateWithdrawTxnsParams,
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
      createInitiateWithdrawTxns: strategy.createInitiateWithdrawTxns,
      getPendingWithdrawal: async aaAddress => {
        const aaPendingWithdrawal = await strategy.getPendingWithdrawal(aaAddress);
        if (aaPendingWithdrawal.canBeCompleted || aaPendingWithdrawal.amount > 0n) {
          return aaPendingWithdrawal;
        }
        // Some protocols (veda) completes withdrawal automatically,
        // so we should check balance of token
        const balance = await tokenContract.read.balanceOf([aaAddress]);
        return {
          canBeCompleted: balance !== 0n,
          amount: await strategy.tokenAmountToBondTokenAmount(balance),
        };
      },
      createCompleteWithdrawTxns: async ({ amount, paramValuesByKey }: CreateWithdrawTxnsParams) => {
        const withdrawTxnsPromise = strategy.createCompleteWithdrawTxns({ amount, paramValuesByKey });
        const tokenAmountPromise = strategy.bondTokenAmountToTokenAmount(amount);
        return [
          ...(await withdrawTxnsPromise),
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

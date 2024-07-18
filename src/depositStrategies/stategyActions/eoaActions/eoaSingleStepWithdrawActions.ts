import { encodeFunctionData } from 'viem';

import { erc20ABI } from '../../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateWithdrawTxnsParams,
  DepositStrategyConfig,
  DepositStrategyWithActions,
  SingleStepWithdrawActions,
} from '../../DepositStrategy';

import { ensureAddress } from './ensureAddress';

export function eoaSingleStepWithdrawActions<
  config extends { isSingleStepWithdraw: true } & DepositStrategyConfig,
  Actions extends SingleStepWithdrawActions<config> & BondTokenActions,
>(
  strategy: DepositStrategyWithActions<config, Actions>,
): SingleStepWithdrawActions<{ isSingleStepWithdraw: true } & config> {
  return {
    createWithdrawTxns: async ({ amount, paramValuesByKey }: CreateWithdrawTxnsParams) => {
      const withdrawTxnsPromise = strategy.createWithdrawTxns({ amount, paramValuesByKey });
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
}

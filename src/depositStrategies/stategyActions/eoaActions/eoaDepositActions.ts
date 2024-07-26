import { encodeFunctionData } from 'viem';

import { erc20ABI } from '../../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateDepositTxnsParams,
  DepositActions,
  DepositStrategyConfig,
  DepositStrategyWithActions,
} from '../../DepositStrategy';

import { ensureAddress } from './ensureAddress';

export function eoaDepositActions<
  config extends DepositStrategyConfig,
  Actions extends DepositActions & BondTokenActions,
>(strategy: DepositStrategyWithActions<config, Actions>): DepositActions {
  return {
    createDepositTxns: async ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => [
      {
        to: strategy.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'transferFrom',
          args: [ensureAddress(paramValuesByKey, 'eoaAddress'), ensureAddress(paramValuesByKey, 'aaAddress'), amount],
        }),
      },
      ...(await strategy.createDepositTxns({ amount, paramValuesByKey })),
    ],
  };
}

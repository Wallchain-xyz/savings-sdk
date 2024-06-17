import { Address, encodeFunctionData } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
  ParamsValuesByKey,
} from '../DepositStrategy';

function ensureAddress(params: ParamsValuesByKey, key: string): Address {
  const value = params[key];
  if (!value) {
    throw new Error(`Parameter ${key} is required!`);
  }
  if (!value.startsWith('0x')) {
    throw new Error(`Parameter ${key} value ${value} is not valid address`);
  }
  return value as Address;
}

export function eoaActions<Actions extends DepositWithdrawActions & BondTokenActions>(
  strategy: DepositStrategyWithActions<Actions>,
): DepositWithdrawActions {
  return {
    createDepositTxns: ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => [
      {
        to: strategy.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'transferFrom',
          args: [ensureAddress(paramValuesByKey, 'eoaAddress'), ensureAddress(paramValuesByKey, 'aaAddress'), amount],
        }),
      },
      ...strategy.createDepositTxns({ amount, paramValuesByKey }),
    ],

    createWithdrawTxns: async ({ amount, paramValuesByKey }: CreateWithdrawTxnsParams) => [
      ...(await strategy.createWithdrawTxns({ amount, paramValuesByKey })),
      {
        to: strategy.tokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20ABI,
          functionName: 'transfer',
          args: [ensureAddress(paramValuesByKey, 'eoaAddress'), await strategy.bondTokenAmountToTokenAmount(amount)],
        }),
      },
    ],
  };
}

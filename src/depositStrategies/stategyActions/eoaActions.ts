import { Address, PublicClient, encodeFunctionData, getContract } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositMultistepWithdrawActions,
  DepositStrategyConfig,
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

export function eoaActions(
  publicClient: PublicClient,
): <
  config extends DepositStrategyConfig,
  Actions extends (DepositWithdrawActions | DepositMultistepWithdrawActions) & BondTokenActions,
>(
  strategy: DepositStrategyWithActions<config, Actions>,
) => DepositWithdrawActions | DepositMultistepWithdrawActions {
  return strategy => {
    const tokenContract = getContract({
      address: strategy.tokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });

    const createDepositTxns = ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => [
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
    ];

    if (strategy.instantWithdraw) {
      return {
        instantWithdraw: true,
        createDepositTxns,
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
    return {
      instantWithdraw: false,
      createDepositTxns,
      createInitiateWithdrawTxns: strategy.createInitiateWithdrawTxns,
      getWithdrawStatus: async paramValuesByKey => {
        const aaStatus = await strategy.getWithdrawStatus(paramValuesByKey);
        if (aaStatus.canBeCompleted || aaStatus.amount > 0n) {
          return aaStatus;
        }
        // Some protocols (veda) completes withdrawal automatically,
        // so we should check balance of token
        const balance = await tokenContract.read.balanceOf([paramValuesByKey.aaAddress as Address]);
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

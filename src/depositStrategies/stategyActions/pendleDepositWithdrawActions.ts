import axios, { AxiosError } from 'axios';
import { Address, encodeFunctionData } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateDepositTxnsParams,
  DepositMultiStepWithdrawActions,
  DepositStrategyWithActions,
  PendleDepositStrategyConfig,
} from '../DepositStrategy';

export function pendleDepositWithdrawActions(
  strategy: DepositStrategyWithActions<PendleDepositStrategyConfig, BondTokenActions>,
): DepositMultiStepWithdrawActions<PendleDepositStrategyConfig> {
  return {
    withdrawStepsCount: 2,
    getPendingWithdrawal: async (address: Address) => {
      return {
        amount: await strategy.getBondTokenBalance(address),
        currentStep: 0,
        isStepCanBeExecuted: false,
      };
    },
    createDepositTxns: async ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => {
      const queryParams = {
        chainId: strategy.config.chainId,
        receiverAddr: paramValuesByKey.aaAddress,
        marketAddr: strategy.config.marketAddr,
        tokenInAddr: strategy.config.tokenAddress,
        amountTokenIn: amount,
        slippage: '0.002',
      };
      let resp;
      try {
        resp = await axios.get('https://api-v2.pendle.finance/sdk/api/v1/addLiquiditySingleToken', {
          params: queryParams,
        });
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 500) {
          // This is often due to really small amount, fallback to no-swap version
          resp = await axios.get('https://api-v2.pendle.finance/sdk/api/v1/addLiquiditySingleTokenKeepYt', {
            params: queryParams,
          });
        } else {
          throw error;
        }
      }
      const txn = resp.data.transaction;

      return [
        {
          to: strategy.config.tokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20ABI,
            functionName: 'approve',
            args: [txn.to, amount],
          }),
        },
        {
          to: txn.to,
          value: 0n,
          data: txn.data,
        },
      ];
    },

    createWithdrawStepTxns: async () => {
      // TODO:@merlin add sentry
      // eslint-disable-next-line no-console
      console.error('CreateWithdrawTxns is under active development');
      return [];
    },
  };
}

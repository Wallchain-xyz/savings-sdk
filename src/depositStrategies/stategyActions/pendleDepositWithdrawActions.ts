import { Address } from 'viem';

import {
  BondTokenActions,
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
    createDepositTxns: async () => {
      // TODO:@merlin add sentry
      // eslint-disable-next-line no-console
      console.error('CreateDepositTxns is under active development');
      return [];
    },

    createWithdrawStepTxns: async () => {
      // TODO:@merlin add sentry
      // eslint-disable-next-line no-console
      console.error('CreateWithdrawTxns is under active development');
      return [];
    },
  };
}

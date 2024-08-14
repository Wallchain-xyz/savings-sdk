import { DepositSingleStepWithdrawActions, PendleDepositStrategyConfig } from '../DepositStrategy';

export function pendleDepositWithdrawActions(): DepositSingleStepWithdrawActions<PendleDepositStrategyConfig> {
  return {
    createDepositTxns: async () => {
      throw new Error('Under active development');
    },

    createWithdrawTxns: async () => {
      throw new Error('Under active development');
    },
  };
}

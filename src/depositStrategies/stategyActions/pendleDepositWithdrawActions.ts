import { DepositSingleStepWithdrawActions, PendleDepositStrategyConfig } from '../DepositStrategy';

export function pendleDepositWithdrawActions(): DepositSingleStepWithdrawActions<PendleDepositStrategyConfig> {
  return {
    createDepositTxns: async () => {
      // TODO:@merlin add sentry
      // eslint-disable-next-line no-console
      console.error('CreateDepositTxns is under active development');
      return [];
    },

    createWithdrawTxns: async () => {
      // TODO:@merlin add sentry
      // eslint-disable-next-line no-console
      console.error('CreateWithdrawTxns is under active development');
      return [];
    },
  };
}

import {
  DepositMultiStepWithdrawActions,
  DepositSingleStepWithdrawActions,
  DepositStrategy,
  DepositStrategyConfig,
} from '../DepositStrategy';

export function zeroDepositWithdrawActions(
  strategy: DepositStrategy,
):
  | DepositSingleStepWithdrawActions<{ isSingleStepWithdraw: true } & DepositStrategyConfig>
  | DepositMultiStepWithdrawActions<{ isSingleStepWithdraw: false } & DepositStrategyConfig> {
  if (strategy.isSingleStepWithdraw) {
    return {
      createDepositTxns: async params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
      createWithdrawTxns: async params => (params.amount === 0n ? [] : strategy.createWithdrawTxns(params)),
    };
  }
  return {
    getPendingWithdrawal: strategy.getPendingWithdrawal,
    withdrawStepsCount: strategy.withdrawStepsCount,
    createDepositTxns: async params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
    createWithdrawStepTxns: async (step, params) =>
      params.amount === 0n ? [] : strategy.createWithdrawStepTxns(step, params),
  };
}

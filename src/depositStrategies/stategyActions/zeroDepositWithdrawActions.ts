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
      createDepositTxns: params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
      createWithdrawTxns: async params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
    };
  }
  return {
    getPendingWithdrawal: strategy.getPendingWithdrawal,
    createDepositTxns: params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
    createInitiateWithdrawTxns: async params =>
      params.amount === 0n ? [] : strategy.createInitiateWithdrawTxns(params),
    createCompleteWithdrawTxns: async params =>
      params.amount === 0n ? [] : strategy.createCompleteWithdrawTxns(params),
  };
}

import {
  DepositMultistepWithdrawActions,
  DepositStrategyConfig,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

export function zeroDepositWithdrawActions<
  config extends DepositStrategyConfig,
  Actions extends DepositWithdrawActions | DepositMultistepWithdrawActions,
>(strategy: DepositStrategyWithActions<config, Actions>): DepositWithdrawActions | DepositMultistepWithdrawActions {
  if (strategy.instantWithdraw) {
    return {
      instantWithdraw: true,
      createDepositTxns: params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
      createWithdrawTxns: async params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
    };
  }
  return {
    instantWithdraw: false,
    getWithdrawStatus: strategy.getWithdrawStatus,
    createDepositTxns: params => (params.amount === 0n ? [] : strategy.createDepositTxns(params)),
    createInitiateWithdrawTxns: async params =>
      params.amount === 0n ? [] : strategy.createInitiateWithdrawTxns(params),
    createCompleteWithdrawTxns: async params =>
      params.amount === 0n ? [] : strategy.createCompleteWithdrawTxns(params),
  };
}

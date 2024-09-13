import {
  BondTokenActions,
  DepositSingleStepWithdrawActions,
  DepositStrategyWithActions,
  NoOpDepositStrategyConfig,
} from '../DepositStrategy';

export function noOpDepositWithdrawActions(
  _: DepositStrategyWithActions<NoOpDepositStrategyConfig, BondTokenActions>,
): DepositSingleStepWithdrawActions<NoOpDepositStrategyConfig> {
  return {
    createDepositTxns: async () => [],
    createWithdrawTxns: async () => [],
  };
}

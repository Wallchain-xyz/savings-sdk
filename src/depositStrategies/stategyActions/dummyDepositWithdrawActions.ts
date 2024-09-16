import {
  BondTokenActions,
  DepositSingleStepWithdrawActions,
  DepositStrategyWithActions,
  DummyDepositStrategyConfig,
} from '../DepositStrategy';

export function dummyDepositWithdrawActions(
  _: DepositStrategyWithActions<DummyDepositStrategyConfig, BondTokenActions>,
): DepositSingleStepWithdrawActions<DummyDepositStrategyConfig> {
  return {
    createDepositTxns: async () => [],
    createWithdrawTxns: async () => [],
  };
}

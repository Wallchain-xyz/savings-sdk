import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyConfig,
  DepositStrategyWithActions,
  DepositWithdrawActions,
} from '../DepositStrategy';

export function zeroDepositWithdrawActions<
  config extends DepositStrategyConfig,
  Actions extends DepositWithdrawActions,
>(strategy: DepositStrategyWithActions<config, Actions>): DepositWithdrawActions {
  return {
    createDepositTxns: ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => {
      if (amount === 0n) {
        return [];
      }
      return strategy.createDepositTxns({ amount, paramValuesByKey });
    },
    createWithdrawTxns: async ({ amount, paramValuesByKey }: CreateWithdrawTxnsParams) => {
      if (amount === 0n) {
        return [];
      }
      return strategy.createWithdrawTxns({ amount, paramValuesByKey });
    },
  };
}

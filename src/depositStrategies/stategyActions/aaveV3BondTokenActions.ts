import { BondTokenActions, DepositStrategyWithActions } from '../DepositStrategy';

export function aaveV3BondTokenActions(_: DepositStrategyWithActions): BondTokenActions {
  return {
    bondTokenAmountToTokenAmount: async (amount: bigint) => {
      return amount;
    },

    tokenAmountToBondTokenAmount: async (amount: bigint) => {
      return amount;
    },
  };
}

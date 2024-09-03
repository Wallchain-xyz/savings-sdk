import { Address, PublicClient, getContract } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import { BondTokenActions, DepositStrategyWithActions, SolvDepositStrategyConfig } from '../DepositStrategy';

export function solvBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<SolvDepositStrategyConfig>) => BondTokenActions {
  return (strategy: DepositStrategyWithActions) => {
    const bondTokenContract = getContract({
      address: strategy.bondTokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });
    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        return amount;
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        return amount;
      },
      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return bondTokenContract.read.balanceOf([address]);
      },
    };
  };
}

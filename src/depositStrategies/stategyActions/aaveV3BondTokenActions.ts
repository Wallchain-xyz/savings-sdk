import { Address, PublicClient, getContract, parseAbi } from 'viem';

import { AaveV3DepositStrategyConfig, BondTokenActions, DepositStrategyWithActions } from '../DepositStrategy';

const aaveV3Abi = parseAbi(['function balanceOf(address owner) view returns (uint256)']);

export function aaveV3BondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<AaveV3DepositStrategyConfig>) => BondTokenActions {
  return (strategy: DepositStrategyWithActions) => {
    const aaveV3Contract = getContract({
      address: strategy.bondTokenAddress,
      abi: aaveV3Abi,
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
        return aaveV3Contract.read.balanceOf([address]);
      },
    };
  };
}

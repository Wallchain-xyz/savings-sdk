import { Address, PublicClient, getContract } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import { BondTokenActions, DepositStrategyWithActions, PendleDepositStrategyConfig } from '../DepositStrategy';

export function pendleBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<PendleDepositStrategyConfig>) => BondTokenActions {
  return (strategy: DepositStrategyWithActions) => {
    const erc20TokenContract = getContract({
      address: strategy.tokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });

    const erc20BondTokenContract = getContract({
      address: strategy.bondTokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });
    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        const bondTokenDecimals = await erc20BondTokenContract.read.decimals();
        const tokenDecimals = await erc20TokenContract.read.decimals();
        return (amount * 10n ** BigInt(tokenDecimals)) / 10n ** BigInt(bondTokenDecimals);
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const bondTokenDecimals = await erc20BondTokenContract.read.decimals();
        const tokenDecimals = await erc20TokenContract.read.decimals();
        return (amount * 10n ** BigInt(bondTokenDecimals)) / 10n ** BigInt(tokenDecimals);
      },
      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return erc20BondTokenContract.read.balanceOf([address]);
      },
    };
  };
}

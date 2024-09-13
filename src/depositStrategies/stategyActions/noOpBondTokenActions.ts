import { Address, PublicClient, getContract } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import { BondTokenActions, DepositStrategyWithActions, NoOpDepositStrategyConfig } from '../DepositStrategy';

export function noOpBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<NoOpDepositStrategyConfig>) => BondTokenActions {
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
        const [bondTokenDecimals, tokenDecimals] = await Promise.all([
          erc20BondTokenContract.read.decimals(),
          erc20TokenContract.read.decimals(),
        ]);
        return (amount * 10n ** BigInt(tokenDecimals)) / 10n ** BigInt(bondTokenDecimals);
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const [bondTokenDecimals, tokenDecimals] = await Promise.all([
          erc20BondTokenContract.read.decimals(),
          erc20TokenContract.read.decimals(),
        ]);
        return (amount * 10n ** BigInt(bondTokenDecimals)) / 10n ** BigInt(tokenDecimals);
      },
      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return erc20BondTokenContract.read.balanceOf([address]);
      },
    };
  };
}

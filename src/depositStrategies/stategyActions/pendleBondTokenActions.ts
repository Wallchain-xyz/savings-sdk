import { Address, PublicClient, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import { BondTokenActions, DepositStrategyWithActions, PendleDepositStrategyConfig } from '../DepositStrategy';

const routerStaticAbi = parseAbi(['function getLpToAssetRate(address market) external view returns (uint256)']);

export function pendleBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<PendleDepositStrategyConfig>) => BondTokenActions {
  return (strategy: DepositStrategyWithActions<PendleDepositStrategyConfig>) => {
    const routerStaticContract = getContract({
      address: strategy.config.routerStaticAddr,
      abi: routerStaticAbi,
      client: publicClient,
    });

    const erc20BondTokenContract = getContract({
      address: strategy.bondTokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });
    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        const [bondTokenDecimals, rate] = await Promise.all([
          erc20BondTokenContract.read.decimals(),
          routerStaticContract.read.getLpToAssetRate([strategy.config.marketAddr]),
        ]);
        return (amount * rate) / 10n ** BigInt(bondTokenDecimals);
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const [bondTokenDecimals, rate] = await Promise.all([
          erc20BondTokenContract.read.decimals(),
          routerStaticContract.read.getLpToAssetRate([strategy.config.marketAddr]),
        ]);
        return (amount * 10n ** BigInt(bondTokenDecimals)) / rate;
      },
      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return erc20BondTokenContract.read.balanceOf([address]);
      },
    };
  };
}

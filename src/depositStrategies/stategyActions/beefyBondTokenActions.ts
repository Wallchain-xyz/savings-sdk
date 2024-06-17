import { PublicClient, getContract, parseAbi } from 'viem';

import { BondTokenActions, DepositStrategyWithActions } from '../DepositStrategy';

const vaultAbi = parseAbi([
  'function getPricePerFullShare() public view returns (uint256)',
  'function decimals() public view returns (uint8)',
]);

export function beefyBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions) => BondTokenActions {
  return (strategy: DepositStrategyWithActions) => {
    const vaultContract = getContract({
      address: strategy.bondTokenAddress,
      abi: vaultAbi,
      client: publicClient,
    });

    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        const pricePerFullShare = await vaultContract.read.getPricePerFullShare();
        const decimals = await vaultContract.read.decimals();
        return (amount * pricePerFullShare) / 10n ** BigInt(decimals);
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const pricePerFullShare = await vaultContract.read.getPricePerFullShare();
        const decimals = await vaultContract.read.decimals();
        return (amount * 10n ** BigInt(decimals)) / pricePerFullShare;
      },
    };
  };
}

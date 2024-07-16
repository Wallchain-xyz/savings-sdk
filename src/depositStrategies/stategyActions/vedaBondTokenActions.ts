import { Address, PublicClient, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import { BondTokenActions, DepositStrategyWithActions, VedaDepositStrategyConfig } from '../DepositStrategy';

const accountantAbi = parseAbi(['function getRateInQuoteSafe(address quote) public view returns (uint256)']);

// Docs: https://docs.veda.tech/

export function vedaBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<VedaDepositStrategyConfig>) => BondTokenActions {
  return strategy => {
    const accountantContract = getContract({
      address: strategy.config.accountantAddress,
      abi: accountantAbi,
      client: publicClient,
    });
    const bondTokenContract = getContract({
      address: strategy.config.bondTokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });

    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        const pricePerFullShare = await accountantContract.read.getRateInQuoteSafe([strategy.tokenAddress]);
        const decimals = await bondTokenContract.read.decimals();
        return (amount * pricePerFullShare) / 10n ** BigInt(decimals);
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const pricePerFullShare = await accountantContract.read.getRateInQuoteSafe([strategy.tokenAddress]);
        const decimals = await bondTokenContract.read.decimals();
        return (amount * 10n ** BigInt(decimals)) / pricePerFullShare;
      },

      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return bondTokenContract.read.balanceOf([address]);
      },
    };
  };
}

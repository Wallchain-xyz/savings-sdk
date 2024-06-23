import { Address, PublicClient, getContract, parseAbi } from 'viem';

import { BondTokenActions, DepositStrategyWithActions, MoonwellDepositStrategyConfig } from '../DepositStrategy';

const moonwellAbi = parseAbi([
  'function mint(uint256 mintAmount) public',
  'function redeem(uint256 redeemTokens) public',
  'function exchangeRateStored() public view returns (uint)',
  'function balanceOf(address owner) view returns (uint256)',
]);

const MOONWELL_EXCHANGE_RATE_FACTOR = 10n ** 18n;

export function moonwellBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<MoonwellDepositStrategyConfig>) => BondTokenActions {
  return (strategy: DepositStrategyWithActions) => {
    const moonwellContract = getContract({
      address: strategy.bondTokenAddress,
      abi: moonwellAbi,
      client: publicClient,
    });

    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        const rate = await moonwellContract.read.exchangeRateStored();
        return (amount * rate) / MOONWELL_EXCHANGE_RATE_FACTOR;
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const rate = await moonwellContract.read.exchangeRateStored();
        return (amount * MOONWELL_EXCHANGE_RATE_FACTOR) / rate;
      },
      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return moonwellContract.read.balanceOf([address]);
      },
    };
  };
}

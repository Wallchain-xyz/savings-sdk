import { PublicClient, getContract, parseAbi } from 'viem';

import { BondTokenActions, DepositStrategyWithActions } from '../DepositStrategy';

const moonwellAbi = parseAbi([
  'function mint(uint256 mintAmount) public',
  'function redeem(uint256 redeemTokens) public',
  'function exchangeRateStored() public view returns (uint)',
]);

const MOONWELL_EXCHANGE_RATE_FACTOR = 10n ** 18n;

export function moonwellBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions) => BondTokenActions {
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
    };
  };
}

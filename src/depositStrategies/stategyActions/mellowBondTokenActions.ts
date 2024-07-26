import { Address, PublicClient, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import { BondTokenActions, DepositStrategyWithActions, MellowDepositStrategyConfig } from '../DepositStrategy';

// Docs: https://docs.veda.tech/

const collectorAbi = parseAbi([
  'struct DepositWrapperParams { bool isDepositPossible; bool isDepositorWhitelisted; bool isWhitelistedToken; uint256 lpAmount; uint256 depositValueUSDC}',
  'function fetchDepositWrapperParams(address vault, address wrapper, address token,uint256 amount) external view returns (DepositWrapperParams)',
  'function fetchWithdrawalAmounts(uint256 lpAmount, address vault) external view returns (uint256[] memory expectedAmounts, uint256[] memory expectedAmountsUSDC)',
]);

const wstETHAbi = parseAbi([
  'function getWstETHByStETH(uint256 _stETHAmount) view returns (uint256)',
  'function getStETHByWstETH(uint256 _wstETHAmount) view returns (uint256)',
]);

export function mellowBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<MellowDepositStrategyConfig>) => BondTokenActions {
  // eslint-disable-next-line unused-imports/no-unused-vars
  return strategy => {
    const vaultContract = getContract({
      address: strategy.bondTokenAddress,
      abi: erc20ABI,
      client: publicClient,
    });

    const collectorContract = getContract({
      address: strategy.config.collectorAddress,
      abi: collectorAbi,
      client: publicClient,
    });

    const wStEthContract = getContract({
      address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      abi: wstETHAbi,
      client: publicClient,
    });

    return {
      bondTokenAmountToTokenAmount: async (amount: bigint) => {
        const [expectedAmounts, _] = await collectorContract.read.fetchWithdrawalAmounts([
          amount,
          strategy.config.bondTokenAddress,
        ]);
        const wstETHAmount = expectedAmounts[0];
        return wStEthContract.read.getStETHByWstETH([wstETHAmount]);
      },

      tokenAmountToBondTokenAmount: async (amount: bigint) => {
        const { lpAmount } = await collectorContract.read.fetchDepositWrapperParams([
          strategy.config.bondTokenAddress,
          strategy.config.wrapperAddress,
          strategy.config.tokenAddress,
          amount,
        ]);
        return lpAmount;
      },

      getBondTokenBalance: async (address: Address): Promise<bigint> => {
        return vaultContract.read.balanceOf([address]);
      },
    };
  };
}

import { Address, PublicClient, getContract, parseAbi } from 'viem';

import { BondTokenActions, DepositStrategyWithActions, FuelDepositStrategyConfig } from '../DepositStrategy';

// Contract source code: https://vscode.blockscan.com/ethereum/0x36fa1d4f525850794463d9bb47fc5a48295a9e45

const vaultAbi = parseAbi(['function getBalance(address user, address token) external view returns (uint256)']);

export function fuelBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<FuelDepositStrategyConfig>) => BondTokenActions {
  return strategy => {
    const vaultContract = getContract({
      address: strategy.config.vaultAddress,
      abi: vaultAbi,
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
        return vaultContract.read.getBalance([address, strategy.tokenAddress]);
      },
    };
  };
}

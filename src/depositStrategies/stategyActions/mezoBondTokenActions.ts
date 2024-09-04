import { Address, PublicClient, getContract, parseAbi, parseAbiItem } from 'viem';

import { sumBigInts } from '../../utils/sum';
import { BondTokenActions, DepositStrategyWithActions, MezoDepositStrategyConfig } from '../DepositStrategy';

// Contract source code: https://vscode.blockscan.com/ethereum/0xd7097af27b14e204564c057c636022fae346fe60

const vaultAbi = parseAbi([
  'struct DepositInfo { uint96 balance;  uint32 unlockAt; uint96 receiptMinted; uint96 feeOwed;uint88 lastFeeIntegral;}',
  'function getDeposit(address depositor, address token, uint256 depositId) external view returns (DepositInfo memory)',
]);

export function mezoBondTokenActions(
  publicClient: PublicClient,
): (strategy: DepositStrategyWithActions<MezoDepositStrategyConfig>) => BondTokenActions {
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
        // Mezo adds globally unique depositId to each deposit,
        // and this value is needed to fetch balance unfortunately
        // To get it, we use `Deposited` event. As it is indexed
        // by depositor address and token, we will only retrieve entries we need.
        // Only problem here is that old logs may be dropped by RPC,
        // if it isn't archival one (ankr should work OK).
        const depositLogs = await publicClient.getLogs({
          address: strategy.config.vaultAddress,
          event: parseAbiItem(
            'event Deposited(address indexed depositor, address indexed token, uint256 indexed depositId, uint256 amount)',
          ),
          args: {
            depositor: address,
            token: strategy.tokenAddress,
          },
        });
        const balances = await Promise.all(
          depositLogs.map(async log => {
            if (!log.args.depositId) {
              return 0n;
            }
            const { balance } = await vaultContract.read.getDeposit([
              address,
              strategy.tokenAddress,
              log.args.depositId,
            ]);
            return balance;
          }),
        );
        return sumBigInts(balances);
      },
    };
  };
}

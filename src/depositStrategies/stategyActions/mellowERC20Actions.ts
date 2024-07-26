import { Address, PublicClient, encodeFunctionData, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  DepositMultiStepWithdrawActions,
  DepositStrategyWithActions,
  MellowDepositStrategyConfig,
} from '../DepositStrategy';

import { ensureAddress } from './eoaActions/ensureAddress';

const depositWrapperAbi = parseAbi([
  'function deposit(address to, address token, uint256 amount, uint256 minLpAmount, uint256 deadline) external payable returns (uint256 lpAmount)',
]);

const collectorAbi = parseAbi([
  'struct DepositWrapperParams { bool isDepositPossible; bool isDepositorWhitelisted; bool isWhitelistedToken; uint256 lpAmount; uint256 depositValueUSDC}',
  'function fetchDepositWrapperParams(address vault, address wrapper, address token,uint256 amount) external view returns (DepositWrapperParams)',
  'function fetchWithdrawalAmounts(uint256 lpAmount, address vault) external view returns (uint256[] memory expectedAmounts, uint256[] memory expectedAmountsUSDC)',
]);

// Docs: https://docs.mellow.finance/

interface MellowERC20ActionsParams {
  publicClient: PublicClient;
  depositDeadlineSeconds?: number;
  withdrawDeadlineSeconds?: number;
  withdrawCompleteDeadlineSeconds?: number;
  depositSlippageNumeratorDenominator?: [bigint, bigint];
}

export function mellowERC20Actions({
  publicClient,
  depositDeadlineSeconds = 3600,
  depositSlippageNumeratorDenominator = [BigInt(10 ** 6 - 1), BigInt(10 ** 6)],
}: MellowERC20ActionsParams): (
  strategy: DepositStrategyWithActions<MellowDepositStrategyConfig>,
) => DepositMultiStepWithdrawActions<MellowDepositStrategyConfig> {
  return strategy => {
    const collectorContract = getContract({
      address: strategy.config.collectorAddress,
      abi: collectorAbi,
      client: publicClient,
    });

    return {
      createDepositTxns: async ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => {
        const { lpAmount } = await collectorContract.read.fetchDepositWrapperParams([
          strategy.config.bondTokenAddress,
          strategy.config.wrapperAddress,
          strategy.config.tokenAddress,
          amount,
        ]);
        const [numerator, denominator] = depositSlippageNumeratorDenominator;
        const lpAmountWithSlippage = (lpAmount * numerator) / denominator;

        const block = await publicClient.getBlock();

        return [
          {
            to: strategy.config.tokenAddress,
            value: 0n,
            data: encodeFunctionData({
              abi: erc20ABI,
              functionName: 'approve',
              args: [strategy.config.wrapperAddress, amount],
            }),
          },
          {
            to: strategy.config.wrapperAddress,
            value: 0n,
            data: encodeFunctionData({
              abi: depositWrapperAbi,
              functionName: 'deposit',
              args: [
                ensureAddress(paramValuesByKey, 'aaAddress'),
                strategy.config.tokenAddress,
                amount,
                lpAmountWithSlippage,
                block.timestamp + BigInt(depositDeadlineSeconds),
              ],
            }),
          },
        ];
      },

      withdrawStepsCount: 3,

      createWithdrawStepTxns: async () => {
        return [];
      },

      getPendingWithdrawal: async (_: Address) => {
        return {
          amount: 0n,
          currentStep: 0,
          isFinalStep: false,
          isStepCanBeExecuted: true,
        };
      },
    };
  };
}

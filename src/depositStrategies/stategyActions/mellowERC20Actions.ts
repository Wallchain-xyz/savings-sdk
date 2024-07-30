import { Address, PublicClient, encodeFunctionData, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  BondTokenActions,
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
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

const vaultAbi = parseAbi([
  'struct WithdrawalRequest { address to; uint256 lpAmount; bytes32 tokensHash;  uint256[] minAmounts; uint256 deadline;uint256 timestamp; }',
  'function registerWithdrawal(address to, uint256 lpAmount, uint256[] memory minAmounts, uint256 deadline, uint256 requestDeadline, bool closePrevious) external',
  'function withdrawalRequest(address user) external view returns (WithdrawalRequest)',
]);

const wStETHAbi = parseAbi([
  'function getWstETHByStETH(uint256 _stETHAmount) view returns (uint256)',
  'function getStETHByWstETH(uint256 _wstETHAmount) view returns (uint256)',
]);

const wStEthWithdrawalQueueAbi = parseAbi([
  'struct WithdrawalRequestStatus { uint256 amountOfStETH; uint256 amountOfShares; address owner; uint256 timestamp; bool isFinalized; bool isClaimed; }',
  'function requestWithdrawalsWstETH(uint256[] _amounts, address _owner) returns (uint256[])',
  'function getWithdrawalRequests(address _owner) view returns (uint256[] requestsIds)',
  'function getWithdrawalStatus(uint256[] _requestIds) view returns (WithdrawalRequestStatus[])',
  'function claimWithdrawal(uint256 _requestId)',
]);

const wethAbi = parseAbi(['function deposit() public payable']);

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
  withdrawDeadlineSeconds = 3600,
  withdrawCompleteDeadlineSeconds = 180 * 24 * 3600,
  depositSlippageNumeratorDenominator = [BigInt(10 ** 6 - 1), BigInt(10 ** 6)],
}: MellowERC20ActionsParams): (
  strategy: DepositStrategyWithActions<MellowDepositStrategyConfig, BondTokenActions>,
) => DepositMultiStepWithdrawActions<MellowDepositStrategyConfig> {
  return strategy => {
    const collectorContract = getContract({
      address: strategy.config.collectorAddress,
      abi: collectorAbi,
      client: publicClient,
    });

    const vaultContract = getContract({
      address: strategy.config.bondTokenAddress,
      abi: vaultAbi,
      client: publicClient,
    });

    const wStEthContract = getContract({
      address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0' as Address,
      abi: [...erc20ABI, ...wStETHAbi],
      client: publicClient,
    });

    const wStEthWithdawalQueueContract = getContract({
      address: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1' as Address,
      abi: wStEthWithdrawalQueueAbi,
      client: publicClient,
    });

    const wethContract = getContract({
      address: strategy.tokenAddress,
      abi: wethAbi,
      client: publicClient,
    });

    const createRequestMellowWithdrawTxns = async ({ amount, paramValuesByKey }: CreateWithdrawTxnsParams) => {
      const [expectedAmounts, _] = await collectorContract.read.fetchWithdrawalAmounts([
        amount,
        strategy.config.bondTokenAddress,
      ]);
      const wStEthAmount = expectedAmounts[0];
      const { timestamp } = await publicClient.getBlock();
      return [
        {
          to: strategy.config.bondTokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: vaultAbi,
            functionName: 'registerWithdrawal',
            args: [
              ensureAddress(paramValuesByKey, 'aaAddress'),
              amount,
              [wStEthAmount],
              timestamp + BigInt(withdrawDeadlineSeconds),
              timestamp + BigInt(withdrawCompleteDeadlineSeconds),
              true,
            ],
          }),
        },
      ];
    };

    const createRequestLidoWithdrawTxns = async ({ paramValuesByKey }: CreateWithdrawTxnsParams) => {
      const aaAddress = ensureAddress(paramValuesByKey, 'aaAddress');
      const wstBalance = await wStEthContract.read.balanceOf([aaAddress]);
      return [
        {
          to: wStEthContract.address,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20ABI,
            functionName: 'approve',
            args: [wStEthWithdawalQueueContract.address, wstBalance],
          }),
        },
        {
          to: wStEthWithdawalQueueContract.address,
          value: 0n,
          data: encodeFunctionData({
            abi: wStEthWithdawalQueueContract.abi,
            functionName: 'requestWithdrawalsWstETH',
            args: [[wstBalance], aaAddress],
          }),
        },
      ];
    };

    const createClaimLidoWithdrawTxns = async ({ paramValuesByKey }: CreateWithdrawTxnsParams) => {
      const aaAddress = ensureAddress(paramValuesByKey, 'aaAddress');
      const requests = await wStEthWithdawalQueueContract.read.getWithdrawalRequests([aaAddress]);
      const requestsData = await wStEthWithdawalQueueContract.read.getWithdrawalStatus([requests]);
      return [
        {
          to: wStEthWithdawalQueueContract.address,
          value: 0n,
          data: encodeFunctionData({
            abi: wStEthWithdawalQueueContract.abi,
            functionName: 'claimWithdrawal',
            args: [requests[0]],
          }),
        },
        {
          to: wethContract.address,
          value: requestsData[0].amountOfStETH,
          data: encodeFunctionData({
            abi: wethContract.abi,
            functionName: 'deposit',
            args: [],
          }),
        },
      ];
    };

    return {
      createDepositTxns: async ({ amount, paramValuesByKey }: CreateDepositTxnsParams) => {
        const { lpAmount } = await collectorContract.read.fetchDepositWrapperParams([
          strategy.config.bondTokenAddress,
          strategy.config.depositWrapperAddress,
          strategy.config.tokenAddress,
          amount,
        ]);
        const [numerator, denominator] = depositSlippageNumeratorDenominator;
        const lpAmountWithSlippage = (lpAmount * numerator) / denominator;

        const { timestamp } = await publicClient.getBlock();

        return [
          {
            to: strategy.config.tokenAddress,
            value: 0n,
            data: encodeFunctionData({
              abi: erc20ABI,
              functionName: 'approve',
              args: [strategy.config.depositWrapperAddress, amount],
            }),
          },
          {
            to: strategy.config.depositWrapperAddress,
            value: 0n,
            data: encodeFunctionData({
              abi: depositWrapperAbi,
              functionName: 'deposit',
              args: [
                ensureAddress(paramValuesByKey, 'aaAddress'),
                strategy.config.tokenAddress,
                amount,
                lpAmountWithSlippage,
                timestamp + BigInt(depositDeadlineSeconds),
              ],
            }),
          },
        ];
      },

      withdrawStepsCount: 3,

      createWithdrawStepTxns: async (step, params: CreateWithdrawTxnsParams) => {
        switch (step) {
          case 0:
            return createRequestMellowWithdrawTxns(params);
          case 1:
            return createRequestLidoWithdrawTxns(params);
          case 2:
            return createClaimLidoWithdrawTxns(params);
          default:
            throw new Error(`Invalid withdraw step ${step}`);
        }
      },

      getPendingWithdrawal: async (aaAddress: Address) => {
        const requests = await wStEthWithdawalQueueContract.read.getWithdrawalRequests([aaAddress]);
        if (requests.length > 0) {
          const requestsData = await wStEthWithdawalQueueContract.read.getWithdrawalStatus([requests]);
          if (requestsData) {
            const { amountOfStETH, isFinalized } = requestsData[0];
            return {
              amount: await strategy.tokenAmountToBondTokenAmount(amountOfStETH),
              currentStep: 2,
              isStepCanBeExecuted: isFinalized,
            };
          }
        }
        const wstBalance = await wStEthContract.read.balanceOf([aaAddress]);
        if (wstBalance !== 0n) {
          return {
            amount: await strategy.tokenAmountToBondTokenAmount(
              await wStEthContract.read.getStETHByWstETH([wstBalance]),
            ),
            currentStep: 1,
            isStepCanBeExecuted: true,
          };
        }
        const { lpAmount } = await vaultContract.read.withdrawalRequest([aaAddress]);
        if (lpAmount !== 0n) {
          return {
            amount: lpAmount,
            currentStep: 1,
            isStepCanBeExecuted: false,
          };
        }
        return {
          amount: 0n,
          currentStep: 0,
          isStepCanBeExecuted: true,
        };
      },
    };
  };
}

import { Address, PublicClient, encodeFunctionData, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositMultiStepWithdrawActions,
  DepositStrategyWithActions,
  VedaDepositStrategyConfig,
} from '../DepositStrategy';

const tellerAbi = parseAbi(['function deposit(address depositAsset,uint256 depositAmount,uint256 minimumMint) public']);

const accountantAbi = parseAbi(['function getRateInQuoteSafe(address quote) public view returns (uint256)']);

const atomicQueueAbi = parseAbi([
  'struct AtomicRequest { uint64 deadline; uint88 atomicPrice; uint96 offerAmount; bool inSolve;}',
  'function updateAtomicRequest(address offer, address want, AtomicRequest userRequest) external',
  'function getUserAtomicRequest(address user, address offer, address want) view returns (AtomicRequest)',
]);

// Docs: https://docs.veda.tech/

interface VedaERC20ActionsParams {
  publicClient: PublicClient;
  withdrawDelaySeconds?: number;
  // Veda withdrawal gas compensation factor
  withdrawDiscountNumeratorDenominator?: [bigint, bigint];
}

export function vedaERC20Actions({
  publicClient,
  withdrawDelaySeconds = 7 * 24 * 3600,
  withdrawDiscountNumeratorDenominator = [9999n, 10000n], // 0.01%
}: VedaERC20ActionsParams): (
  strategy: DepositStrategyWithActions<VedaDepositStrategyConfig>,
) => DepositMultiStepWithdrawActions<VedaDepositStrategyConfig> {
  return strategy => {
    const accountantContract = getContract({
      address: strategy.config.accountantAddress,
      abi: accountantAbi,
      client: publicClient,
    });
    const queueContract = getContract({
      address: strategy.config.atomicQueueAddress,
      abi: atomicQueueAbi,
      client: publicClient,
    });

    const createRequestVedaWithdrawTxns = async ({ amount }: CreateWithdrawTxnsParams) => {
      const currentPrice = await accountantContract.read.getRateInQuoteSafe([strategy.config.tokenAddress]);
      const [numerator, denominator] = withdrawDiscountNumeratorDenominator;
      const discountedPrice = (currentPrice * numerator) / denominator;
      return [
        {
          to: strategy.config.bondTokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20ABI,
            functionName: 'approve',
            args: [strategy.config.atomicQueueAddress, amount],
          }),
        },
        {
          to: strategy.config.atomicQueueAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: atomicQueueAbi,
            functionName: 'updateAtomicRequest',
            args: [
              strategy.config.bondTokenAddress,
              strategy.config.tokenAddress,
              {
                deadline: BigInt(Math.floor(Date.now())) / 1000n + BigInt(withdrawDelaySeconds),
                atomicPrice: discountedPrice,
                offerAmount: amount,
                inSolve: false,
              },
            ],
          }),
        },
      ];
    };

    return {
      createDepositTxns: async ({ amount }: CreateDepositTxnsParams) => [
        {
          to: strategy.config.tokenAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20ABI,
            functionName: 'approve',
            args: [strategy.config.bondTokenAddress, amount],
          }),
        },
        {
          to: strategy.config.tellerAddress,
          value: 0n,
          data: encodeFunctionData({
            abi: tellerAbi,
            functionName: 'deposit',
            args: [strategy.config.tokenAddress, amount, 0n],
          }),
        },
      ],

      getPendingWithdrawal: async (aaAddress: Address) => {
        const res = await queueContract.read.getUserAtomicRequest([
          aaAddress,
          strategy.bondTokenAddress,
          strategy.tokenAddress,
        ]);

        const hasEntryInQueue = res.offerAmount > 0n;

        return {
          amount: res.offerAmount,
          currentStep: hasEntryInQueue ? 1 : 0,
          isFinalStep: hasEntryInQueue,
          isStepCanBeExecuted: !hasEntryInQueue, // queue processing done by Veda
        };
      },

      withdrawStepsCount: 2,

      createWithdrawStepTxns: async (step, params) => {
        if (step === 0) {
          return createRequestVedaWithdrawTxns(params);
        }
        if (step === 1) {
          return [];
        }
        throw new Error(`Invalid withdraw step ${step}`);
      },
    };
  };
}

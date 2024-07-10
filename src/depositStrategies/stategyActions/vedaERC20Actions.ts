import { PublicClient, encodeFunctionData, getContract, parseAbi } from 'viem';

import { erc20ABI } from '../../utils/erc20ABI';
import {
  CreateDepositTxnsParams,
  CreateWithdrawTxnsParams,
  DepositStrategyWithActions,
  DepositWithdrawActions,
  EtherFiDepositStrategyConfig,
} from '../DepositStrategy';

const tellerAbi = parseAbi(['function deposit(address depositAsset,uint256 depositAmount,uint256 minimumMint) public']);

const accountantAbi = parseAbi(['function getRateInQuoteSafe(address quote) public view returns (uint256)']);

const atomicQueueAbi = parseAbi([
  'struct AdditionalRecipient { uint64 deadline; uint88 atomicPrice; uint96 offerAmount; bool inSolve;}',
  'function updateAtomicRequest(address offer, address want, AdditionalRecipient userRequest) external',
]);

// Docs: https://docs.veda.tech/

interface VedaERC20ActionsParams {
  publicClient: PublicClient;
  withdrawDelaySeconds?: number;
  withdrawDiscountFraction?: [bigint, bigint];
}

export function vedaERC20Actions({
  publicClient,
  withdrawDelaySeconds = 7 * 24 * 3600,
  withdrawDiscountFraction = [9999n, 10000n], // 0.01%
}: VedaERC20ActionsParams): (
  strategy: DepositStrategyWithActions<EtherFiDepositStrategyConfig>,
) => DepositWithdrawActions {
  return strategy => {
    const accountantContract = getContract({
      address: strategy.config.accountantAddress,
      abi: accountantAbi,
      client: publicClient,
    });

    return {
      createDepositTxns: ({ amount }: CreateDepositTxnsParams) => [
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

      createWithdrawTxns: async ({ amount }: CreateWithdrawTxnsParams) => {
        const currentPrice = await accountantContract.read.getRateInQuoteSafe([strategy.config.tokenAddress]);
        const discountedPrice = (currentPrice * withdrawDiscountFraction[0]) / withdrawDiscountFraction[1];
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
      },
    };
  };
}
